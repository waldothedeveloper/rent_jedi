"use server";

import {
  createInviteDAL,
  getInviteByIdDAL,
  getInviteByTokenDAL,
  linkTenantToUserDAL,
  revokeInviteDAL,
  updateInviteStatusDAL,
} from "@/dal/invites";
import { getPropertyByIdDAL, verifySessionDAL } from "@/dal/properties";
import {
  tenantInviteLoginSchema,
  tenantInviteSignupSchema,
} from "@/lib/shared-auth-schema";

import { auth } from "@/lib/auth";
import { getTenantByIdDAL } from "@/dal/tenants";
import { headers } from "next/headers";
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

type HeadersLike = Pick<Headers, "get"> | null | undefined;

function getBaseUrl(headersList?: HeadersLike) {
  const envUrl =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;
  const origin = headersList?.get("origin");
  const host = headersList?.get("host");
  const rawBase = envUrl ?? origin ?? (host ? `http://${host}` : undefined);
  const withProtocol = rawBase?.startsWith("http")
    ? rawBase
    : rawBase
      ? `https://${rawBase}`
      : "http://localhost:3000";

  return withProtocol.replace(/\/$/, "");
}

async function parseEmailError(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

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

  // Fetch tenant and property details in parallel (independent reads)
  const [tenantResult, propertyResult] = await Promise.all([
    getTenantByIdDAL(data.tenantId),
    getPropertyByIdDAL(data.propertyId),
  ]);

  if (!tenantResult.success || !tenantResult.data) {
    return {
      success: false,
      message: tenantResult.message || "Tenant not found.",
    };
  }

  const { data: tenantData } = tenantResult;

  // Tenant must have an email to receive invitation
  if (!tenantData.email) {
    return {
      success: false,
      message: "Tenant does not have an email address. Cannot send invitation.",
    };
  }

  if (!propertyResult.success || !propertyResult.data) {
    return {
      success: false,
      message: propertyResult.message || "Property not found.",
    };
  }

  const { data: propertyData } = propertyResult;

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
  const baseUrl = getBaseUrl(await headers());

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
      const errorData = await parseEmailError(emailResponse);
      const bodyPreview =
        typeof errorData === "string" ? errorData.slice(0, 500) : errorData;
      console.error("Failed to send invitation email:", {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        contentType: emailResponse.headers.get("content-type"),
        body: bodyPreview,
      });
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

  if (!inviteData) {
    return { success: false, message: "Invitation data not found." };
  }

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

/**
 * Validate invite token (public - no auth required)
 * Returns invite details for display on acceptance page
 */
export async function validateInviteToken(token: string) {
  if (!token) {
    return { success: false, message: "Invitation token is required." };
  }

  const result = await getInviteByTokenDAL(token);

  if (!result.success) {
    return { success: false, message: result.message };
  }

  if (!result.data) {
    return { success: false, message: "Invitation data not found." };
  }

  // Return minimal sanitized data for public display (security: no property details)
  return {
    success: true,
    data: {
      inviteeEmail: result.data.inviteeEmail,
      inviteeName: result.data.inviteeName,
      expiresAt: result.data.expiresAt,
    },
  };
}

/**
 * Accept tenant invite with new account signup
 */
export async function acceptTenantInviteWithSignup(
  input: z.infer<typeof tenantInviteSignupSchema>,
) {
  const { success, data, error } = tenantInviteSignupSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  // Validate invite token
  const inviteResult = await getInviteByTokenDAL(data.token);
  if (!inviteResult.success) {
    return { success: false, message: inviteResult.message };
  }

  if (!inviteResult.data) {
    return { success: false, message: "Invitation data not found." };
  }

  const invite = inviteResult.data;

  // Verify email matches invite (case-insensitive)
  if (
    data.email.toLowerCase().trim() !== invite.inviteeEmail.toLowerCase().trim()
  ) {
    return {
      success: false,
      message: `This invitation was sent to ${invite.inviteeEmail}. Please use that email address.`,
    };
  }

  try {
    // Create user account via Better Auth
    // The database hook will automatically assign "tenant" role if pending invite exists
    let signupResult;
    try {
      signupResult = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
        },
      });
    } catch (signupError: any) {
      // Handle duplicate email error
      if (
        signupError?.message?.includes("email") ||
        signupError?.message?.includes("exists") ||
        signupError?.message?.includes("already")
      ) {
        return {
          success: false,
          message:
            "An account with this email already exists. Please try signing in instead.",
        };
      }
      return {
        success: false,
        message: signupError?.message || "Failed to create account.",
      };
    }

    if (!signupResult || !signupResult.user) {
      return { success: false, message: "Failed to create account." };
    }

    const userId = signupResult.user.id;

    // Link tenant record to user account
    const linkResult = await linkTenantToUserDAL(invite.tenantId!, userId);
    if (!linkResult.success) {
      console.error("Failed to link tenant to user:", linkResult.message);
      // Continue anyway - user account is created, we can fix the link later
    }

    // Update invite status to accepted
    await updateInviteStatusDAL(invite.id, "accepted");

    // Send confirmation email to tenant (non-blocking)
    const baseUrl = getBaseUrl(await headers());

    fetch(`${baseUrl}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.email,
        subject: `Welcome to ${invite.property?.name || "your rental property"}`,
        template: "tenant-invite-accepted",
        firstName: data.name.split(" ")[0],
        propertyName: invite.property?.name,
        propertyAddress: invite.property?.address,
        unitNumber: undefined,
      }),
    }).catch((e) => console.error("Failed to send tenant email:", e));

    revalidatePath("/owners/tenants");

    return {
      success: true,
      message: "Account created successfully!",
      redirect: "/invite/welcome",
    };
  } catch (error) {
    console.error("Error accepting invite with signup:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating your account.",
    };
  }
}

/**
 * Accept tenant invite with existing account login
 */
export async function acceptTenantInviteWithLogin(
  input: z.infer<typeof tenantInviteLoginSchema>,
) {
  const { success, data, error } = tenantInviteLoginSchema.safeParse(input);

  if (!success) {
    return { success: false, errors: error, message: "Validation failed." };
  }

  // Validate invite token
  const inviteResult = await getInviteByTokenDAL(data.token);
  if (!inviteResult.success) {
    return { success: false, message: inviteResult.message };
  }

  if (!inviteResult.data) {
    return { success: false, message: "Invitation data not found." };
  }

  const invite = inviteResult.data;

  try {
    // Authenticate user
    let loginResult;
    try {
      loginResult = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.password,
        },
      });
    } catch (loginError: any) {
      return {
        success: false,
        message:
          loginError?.message ||
          "Invalid credentials. Please check your email and password.",
      };
    }

    if (!loginResult || !loginResult.user) {
      return { success: false, message: "Authentication failed." };
    }

    const user = loginResult.user;

    // Check for role conflicts (block owner/admin)
    if (user.role !== "tenant") {
      return {
        success: false,
        message: `Your account is registered as ${user.role}. Tenant invitations cannot be accepted by ${user.role} accounts. Please contact support if you need assistance.`,
      };
    }

    // Verify email matches invite (case-insensitive)
    if (
      user.email.toLowerCase().trim() !==
      invite.inviteeEmail.toLowerCase().trim()
    ) {
      return {
        success: false,
        message: `Email mismatch. This invitation was sent to ${invite.inviteeEmail}, but you're trying to sign in with ${user.email}. Please use the correct email or contact
  your landlord.`,
      };
    }

    // Link tenant record to user account (if not already linked)
    const linkResult = await linkTenantToUserDAL(invite.tenantId!, user.id);
    if (!linkResult.success) {
      console.error("Failed to link tenant to user:", linkResult.message);
      // Continue anyway - we can fix the link later
    }

    // Update invite status to accepted
    await updateInviteStatusDAL(invite.id, "accepted");

    // Send confirmation email to tenant (non-blocking)
    const baseUrl = getBaseUrl(await headers());

    fetch(`${baseUrl}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: user.email,
        subject: `Welcome to ${invite.property?.name || "your rental property"}`,
        template: "tenant-invite-accepted",
        firstName: user.name.split(" ")[0],
        propertyName: invite.property?.name,
        propertyAddress: invite.property?.address,
        unitNumber: undefined,
      }),
    }).catch((e) => console.error("Failed to send tenant email:", e));

    revalidatePath("/owners/tenants");

    return {
      success: true,
      message: "Invitation accepted successfully!",
      redirect: "/invite/welcome",
    };
  } catch (error) {
    console.error("Error accepting invite with login:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while accepting the invitation.",
    };
  }
}
