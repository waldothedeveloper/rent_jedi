"use server";

import {
  createInviteDAL,
  getInviteByIdDAL,
  revokeInviteDAL,
} from "@/dal/invites";
import { getPropertyByIdDAL, verifySessionDAL } from "@/dal/properties";

import { getTenantByIdDAL } from "@/dal/tenants";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sendInvitationSchema = z.object({
  tenantId: z.uuid(),
  unitId: z.uuid(),
  propertyId: z.uuid(),
});

const createPendingInviteSchema = z.object({
  tenantId: z.uuid(),
  propertyId: z.uuid(),
});

/**
 * Send tenant invitation email
 * Creates invite record and sends email
 */
export async function sendTenantInvitation(
  input: z.infer<typeof sendInvitationSchema>,
) {
  const { success, data, error } = sendInvitationSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  // Get tenant details
  const tenantResult = await getTenantByIdDAL(data.tenantId);
  if (!tenantResult.success || !tenantResult.data) {
    return {
      success: false,
      message: tenantResult.message || "Tenant not found.",
    };
  }

  const tenantData = tenantResult.data;

  // Tenant must have an email to receive invitation
  if (!tenantData.email) {
    return {
      success: false,
      message: "Tenant does not have an email address. Cannot send invitation.",
    };
  }

  // Get property details
  const propertyResult = await getPropertyByIdDAL(data.propertyId);
  if (!propertyResult.success || !propertyResult.data) {
    return {
      success: false,
      message: propertyResult.message || "Property not found.",
    };
  }

  const propertyData = propertyResult.data;

  // Find the specific unit from the property's units array
  const unitData = propertyData.units.find((u) => u.id === data.unitId);

  // Build property address string
  const addressParts = [propertyData.addressLine1];
  if (propertyData.addressLine2) {
    addressParts.push(propertyData.addressLine2);
  }
  addressParts.push(
    `${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`,
  );
  const propertyAddress = addressParts.join(", ");

  // Create invite record
  const inviteResult = await createInviteDAL({
    propertyId: data.propertyId,
    tenantId: data.tenantId,
    inviteeEmail: tenantData.email,
    inviteeName: tenantData.name,
    sendEmail: true,
  });

  if (!inviteResult.success) {
    return { success: false, message: inviteResult.message };
  }

  const inviteData = inviteResult.data;

  // Build invite URL
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.VERCEL_URL}`;

  const inviteUrl = `${baseUrl}/invite/accept?token=${inviteData.token}`;

  // Build subject line with property name or address
  const subjectProperty = propertyData.name || propertyData.addressLine1;

  try {
    // Get owner details for the email
    const session = await verifySessionDAL();
    if (!session) {
      return { success: false, message: "You must be signed in." };
    }

    // Send email via API route
    const emailResponse = await fetch(`${baseUrl}/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: tenantData.email,
        subject: `Action Required: Set up your rental at ${subjectProperty}`,
        template: "tenant-invitation",
        firstName: tenantData.name.split(" ")[0],
        inviteUrl,
        propertyName: propertyData.name || propertyData.addressLine1,
        propertyAddress,
        unitNumber: unitData?.unitNumber,
        ownerName: session.user.name || "Your landlord",
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Failed to send invitation email:", errorData);
      return {
        success: false,
        message:
          "Invitation created but email failed to send. You can resend later.",
        inviteId: inviteData.id,
      };
    }
  } catch (emailError) {
    console.error("Error sending invitation email:", emailError);
    return {
      success: false,
      message:
        "Invitation created but email failed to send. You can resend later.",
      inviteId: inviteData.id,
    };
  }

  revalidatePath("/owners/tenants");

  return {
    success: true,
    inviteId: inviteData.id,
    message: "Invitation sent successfully!",
  };
}

/**
 * Create pending invite without sending email
 * For "Send Later" option
 */
export async function createPendingInvite(
  input: z.infer<typeof createPendingInviteSchema>,
) {
  const { success, data, error } = createPendingInviteSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  // Get tenant details
  const tenantResult = await getTenantByIdDAL(data.tenantId);
  if (!tenantResult.success || !tenantResult.data) {
    return {
      success: false,
      message: tenantResult.message || "Tenant not found.",
    };
  }

  const tenantData = tenantResult.data;

  // Tenant must have an email for future invitation
  if (!tenantData.email) {
    return {
      success: false,
      message:
        "Tenant does not have an email address. Cannot create invitation.",
    };
  }

  // Create invite record without sending email
  const inviteResult = await createInviteDAL({
    propertyId: data.propertyId,
    tenantId: data.tenantId,
    inviteeEmail: tenantData.email,
    inviteeName: tenantData.name,
    sendEmail: false,
  });

  if (!inviteResult.success) {
    return { success: false, message: inviteResult.message };
  }

  revalidatePath("/owners/tenants");

  return {
    success: true,
    inviteId: inviteResult.data.id,
    message:
      "Invitation created. You can send it later from the tenant details.",
  };
}

/**
 * Resend invitation email
 * Revokes old invite and creates new one
 */
export async function resendInvitation(inviteId: string) {
  if (!inviteId || !z.uuid().safeParse(inviteId).success) {
    return { success: false, message: "Invalid invitation ID." };
  }

  // Get existing invite
  const existingInvite = await getInviteByIdDAL(inviteId);
  if (!existingInvite.success) {
    return { success: false, message: existingInvite.message };
  }

  const inviteData = existingInvite.data;

  if (!inviteData.tenantId) {
    return { success: false, message: "Invitation is not linked to a tenant." };
  }

  // Get property ID from the invite
  const propertyId = inviteData.propertyId;

  // Get tenant details to find unitId
  const tenantResult = await getTenantByIdDAL(inviteData.tenantId);
  if (!tenantResult.success || !tenantResult.data) {
    return { success: false, message: "Tenant not found." };
  }

  const unitId = tenantResult.data.unitId;
  if (!unitId) {
    return { success: false, message: "Tenant is not assigned to a unit." };
  }

  // Send new invitation
  return sendTenantInvitation({
    tenantId: inviteData.tenantId,
    unitId,
    propertyId,
  });
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(inviteId: string) {
  if (!inviteId || !z.uuid().safeParse(inviteId).success) {
    return { success: false, message: "Invalid invitation ID." };
  }

  const result = await revokeInviteDAL(inviteId);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  revalidatePath("/owners/tenants");

  return {
    success: true,
    message: "Invitation revoked successfully.",
  };
}
