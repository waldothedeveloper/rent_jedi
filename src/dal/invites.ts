"server only";

import { and, desc, eq, sql } from "drizzle-orm";

import type { Roles } from "@/types/roles";
import { auth } from "@/lib/auth";
import { cache } from "react";
import crypto from "crypto";
import { db } from "@/db/drizzle";
import { invite } from "@/db/schema/invites-schema";
import { property } from "@/db/schema/properties-schema";
import { tenant } from "@/db/schema/tenants-schema";
import { verifySessionDAL } from "@/dal/properties";

/*

TYPE DEFINITIONS

*/

type InviteInsert = typeof invite.$inferInsert;
type InviteSelect = typeof invite.$inferSelect;

export type InviteWithDetails = InviteSelect & {
  property?: typeof property.$inferSelect | null;
  tenant?: typeof tenant.$inferSelect | null;
};

// DTO for public invite token lookup - minimal fields for invite acceptance page
// Note: tenantId is included for server-side processing but should NOT be exposed to client
export type InviteByTokenDTO = {
  id: string;
  tenantId: string | null;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: Date | null;
  inviteeName: string | null;
  inviteeEmail: string;
  role: string;
  property: {
    name: string | null;
    address: string; // Formatted address string
  } | null;
  tenant: {
    name: string;
  } | null;
};

type CreateInviteResult =
  | { success: true; data: InviteSelect }
  | { success: false; message: string };

type GetInviteResult =
  | { success: true; data?: InviteWithDetails }
  | { success: false; message: string };

type GetInviteByTokenResult =
  | { success: true; data: InviteByTokenDTO }
  | { success: false; message: string };

type UpdateInviteResult =
  | { success: true; data: InviteSelect }
  | { success: false; message: string };

/*

ERROR MESSAGES

*/

const ERRORS = {
  NOT_SIGNED_IN_CREATE: "You must be signed in to create an invitation.",
  NOT_SIGNED_IN_VIEW: "You must be signed in to view invitations.",
  NOT_SIGNED_IN_LIST: "You must be signed in to list invitations.",
  NOT_SIGNED_IN_UPDATE: "You must be signed in to update invitations.",
  NO_CREATE_PERMISSION: "You do not have permission to create invitations.",
  NO_VIEW_PERMISSION: "You do not have permission to view invitations.",
  NO_LIST_PERMISSION: "You do not have permission to list invitations.",
  PROPERTY_NOT_FOUND: "Property not found.",
  TENANT_NOT_FOUND: "Tenant not found.",
  INVITE_NOT_FOUND: "Invitation not found.",
  NO_PROPERTY_PERMISSION:
    "You do not have permission to invite tenants to this property.",
  NO_TENANT_PERMISSION: "You do not have permission to invite this tenant.",
  NO_VIEW_THIS_INVITE: "You do not have permission to view this invitation.",
  NO_UPDATE_THIS_INVITE:
    "You do not have permission to update this invitation.",
  FAILED_TO_CREATE: "Failed to create invitation.",
  FAILED_TO_UPDATE: "Failed to update invitation.",
  INVITE_ALREADY_ACCEPTED:
    "This tenant has already accepted an invitation for this property.",
  INVITE_EXPIRED:
    "This invitation has expired. Please contact your landlord for a new invitation.",
  INVITE_NOT_FOUND_OR_EXPIRED: "Invitation not found or has expired.",
} as const;

/*

HELPER FUNCTIONS

*/

const buildInviteWithDetails = (result: {
  invite: InviteSelect;
  property: typeof property.$inferSelect | null;
  tenant: typeof tenant.$inferSelect | null;
}): InviteWithDetails => ({
  ...result.invite,
  property: result.property,
  tenant: result.tenant,
});

/*

PERMISSION CHECK FUNCTIONS

*/

export const canCreateInvite = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        invite: ["create"],
      },
    },
  });

  return permissionCheck.success;
});

export const canViewInvite = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        invite: ["view"],
      },
    },
  });

  return permissionCheck.success;
});

export const canListInvites = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        invite: ["list"],
      },
    },
  });

  return permissionCheck.success;
});

export const canDeleteInvite = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        invite: ["delete"],
      },
    },
  });

  return permissionCheck.success;
});

/*

DAL FUNCTIONS

*/

export const createInviteDAL = async (data: {
  propertyId: string;
  tenantId: string;
  inviteeEmail: string;
  inviteeName?: string;
  sendEmail?: boolean;
}): Promise<CreateInviteResult> => {
  const session = await verifySessionDAL();

  if (!session) {
    return { success: false, message: ERRORS.NOT_SIGNED_IN_CREATE };
  }

  const hasPermission = await canCreateInvite(
    session.user.id,
    session.user.role as Roles,
  );

  if (!hasPermission) {
    return { success: false, message: ERRORS.NO_CREATE_PERMISSION };
  }

  const inviteeEmail = data.inviteeEmail.trim();
  const normalizedInviteeEmail = inviteeEmail.toLowerCase();

  // Run all three independent queries in parallel
  const [
    propertyRows,
    tenantRows,
    existingInviteRows,
    existingPropertyInviteRows,
  ] = await Promise.all([
    db.select().from(property).where(eq(property.id, data.propertyId)).limit(1),
    db.select().from(tenant).where(eq(tenant.id, data.tenantId)).limit(1),
    db
      .select()
      .from(invite)
      .where(
        and(eq(invite.tenantId, data.tenantId), eq(invite.status, "pending")),
      )
      .limit(1),
    db
      .select()
      .from(invite)
      .where(
        and(
          eq(invite.propertyId, data.propertyId),
          sql`lower(${invite.inviteeEmail}) = ${normalizedInviteeEmail}`,
        ),
      )
      .orderBy(desc(invite.createdAt))
      .limit(1),
  ]);

  const propertyRecord = propertyRows[0];
  const tenantRecord = tenantRows[0];
  const existingInvite = existingInviteRows[0];
  const existingPropertyInvite = existingPropertyInviteRows[0];

  // Verify property ownership
  if (!propertyRecord) {
    return { success: false, message: ERRORS.PROPERTY_NOT_FOUND };
  }

  if (propertyRecord.organizationId !== session.user.id) {
    return { success: false, message: ERRORS.NO_PROPERTY_PERMISSION };
  }

  // Verify tenant ownership
  if (!tenantRecord) {
    return { success: false, message: ERRORS.TENANT_NOT_FOUND };
  }

  if (tenantRecord.organizationId !== session.user.id) {
    return { success: false, message: ERRORS.NO_TENANT_PERMISSION };
  }

  // Generate secure token and expiration date (14 days)
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 14);

  // Revoke existing invite if present
  if (existingInvite && existingInvite.id !== existingPropertyInvite?.id) {
    await db
      .update(invite)
      .set({
        status: "revoked",
        revokedAt: new Date(),
      })
      .where(eq(invite.id, existingInvite.id));
  }

  if (existingPropertyInvite) {
    if (existingPropertyInvite.status === "accepted") {
      return { success: false, message: ERRORS.INVITE_ALREADY_ACCEPTED };
    }

    const updatedInvite = await db
      .update(invite)
      .set({
        organizationId: session.user.id,
        tenantId: data.tenantId,
        inviteeEmail: normalizedInviteeEmail,
        inviteeName: data.inviteeName,
        role: "tenant",
        status: "pending",
        token,
        expiresAt,
        revokedAt: null,
        acceptedAt: null,
      })
      .where(eq(invite.id, existingPropertyInvite.id))
      .returning()
      .then((rows) => rows[0]);

    if (!updatedInvite) {
      return { success: false, message: ERRORS.FAILED_TO_UPDATE };
    }

    return { success: true, data: updatedInvite };
  }

  // Create new invite
  const newInvite = await db
    .insert(invite)
    .values({
      propertyId: data.propertyId,
      organizationId: session.user.id,
      tenantId: data.tenantId,
      inviteeEmail: normalizedInviteeEmail,
      inviteeName: data.inviteeName,
      role: "tenant",
      status: "pending",
      token,
      expiresAt,
    })
    .returning()
    .then((rows) => rows[0]);

  if (!newInvite) {
    return { success: false, message: ERRORS.FAILED_TO_CREATE };
  }

  return { success: true, data: newInvite };
};

export const getInviteByIdDAL = cache(
  async (inviteId: string): Promise<GetInviteResult> => {
    const sessionPromise = verifySessionDAL();
    const queryPromise = db
      .select({
        invite: invite,
        property: property,
        tenant: tenant,
      })
      .from(invite)
      .leftJoin(property, eq(invite.propertyId, property.id))
      .leftJoin(tenant, eq(invite.tenantId, tenant.id))
      .where(eq(invite.id, inviteId))
      .limit(1);

    const session = await sessionPromise;
    if (!session) {
      return { success: false, message: ERRORS.NOT_SIGNED_IN_VIEW };
    }

    const hasPermission = await canViewInvite(
      session.user.id,
      session.user.role as Roles,
    );

    if (!hasPermission) {
      return { success: false, message: ERRORS.NO_VIEW_PERMISSION };
    }

    const results = await queryPromise;
    const result = results[0];

    if (!result) {
      return { success: false, message: ERRORS.INVITE_NOT_FOUND };
    }

    if (result.invite.organizationId !== session.user.id) {
      return { success: false, message: ERRORS.NO_VIEW_THIS_INVITE };
    }

    return { success: true, data: buildInviteWithDetails(result) };
  },
);

export const getInviteByTokenDAL = cache(
  async (tokenValue: string): Promise<GetInviteByTokenResult> => {
    // Only select the specific fields needed for the invite acceptance page
    const results = await db
      .select({
        id: invite.id,
        tenantId: invite.tenantId,
        status: invite.status,
        expiresAt: invite.expiresAt,
        inviteeName: invite.inviteeName,
        inviteeEmail: invite.inviteeEmail,
        role: invite.role,
        propertyName: property.name,
        propertyAddressLine1: property.addressLine1,
        propertyCity: property.city,
        propertyState: property.state,
        propertyZipCode: property.zipCode,
        tenantName: tenant.name,
      })
      .from(invite)
      .leftJoin(property, eq(invite.propertyId, property.id))
      .leftJoin(tenant, eq(invite.tenantId, tenant.id))
      .where(eq(invite.token, tokenValue))
      .limit(1);

    const result = results[0];

    if (!result) {
      return { success: false, message: ERRORS.INVITE_NOT_FOUND_OR_EXPIRED };
    }

    // Check if expired
    if (result.expiresAt && new Date() > result.expiresAt) {
      // Auto-update status to expired if still pending
      if (result.status === "pending") {
        await db
          .update(invite)
          .set({ status: "expired" })
          .where(eq(invite.id, result.id));
      }

      return { success: false, message: ERRORS.INVITE_EXPIRED };
    }

    // Check if already used or revoked
    if (result.status !== "pending") {
      return {
        success: false,
        message: `This invitation has been ${result.status}. If you believe this is an error, please contact your landlord.`,
      };
    }

    // Build the DTO with only the fields needed for the acceptance page
    const dto: InviteByTokenDTO = {
      id: result.id,
      tenantId: result.tenantId,
      status: result.status,
      expiresAt: result.expiresAt,
      inviteeName: result.inviteeName,
      inviteeEmail: result.inviteeEmail,
      role: result.role,
      property: result.propertyAddressLine1
        ? {
            name: result.propertyName,
            address: `${result.propertyAddressLine1}, ${result.propertyCity}, ${result.propertyState} ${result.propertyZipCode}`,
          }
        : null,
      tenant: result.tenantName
        ? {
            name: result.tenantName,
          }
        : null,
    };

    return { success: true, data: dto };
  },
);

export const listInvitesByOwnerDAL = cache(async () => {
  const session = await verifySessionDAL();

  if (!session) {
    return { success: false as const, message: ERRORS.NOT_SIGNED_IN_LIST };
  }

  // Run permission check and query in parallel
  const [hasPermission, results] = await Promise.all([
    canListInvites(session.user.id, session.user.role as Roles),
    db
      .select({
        invite: invite,
        property: property,
        tenant: tenant,
      })
      .from(invite)
      .leftJoin(property, eq(invite.propertyId, property.id))
      .leftJoin(tenant, eq(invite.tenantId, tenant.id))
      .where(eq(invite.organizationId, session.user.id))
      .orderBy(desc(invite.createdAt)),
  ]);

  if (!hasPermission) {
    return { success: false as const, message: ERRORS.NO_LIST_PERMISSION };
  }

  const invites = results.map(buildInviteWithDetails);

  return { success: true as const, data: invites };
});

export const updateInviteStatusDAL = async (
  inviteId: string,
  status: "accepted" | "revoked" | "expired",
): Promise<UpdateInviteResult> => {
  // Start both operations immediately
  const sessionPromise = verifySessionDAL();
  const invitePromise = db
    .select()
    .from(invite)
    .where(eq(invite.id, inviteId))
    .limit(1);

  const session = await sessionPromise;
  if (!session) {
    return { success: false, message: ERRORS.NOT_SIGNED_IN_UPDATE };
  }

  const inviteRows = await invitePromise;
  const inviteRecord = inviteRows[0];

  if (!inviteRecord) {
    return { success: false, message: ERRORS.INVITE_NOT_FOUND };
  }

  // Verify ownership (unless accepting - which would be done by the invitee)
  if (status !== "accepted" && inviteRecord.organizationId !== session.user.id) {
    return { success: false, message: ERRORS.NO_UPDATE_THIS_INVITE };
  }

  const updateData: Partial<InviteInsert> = { status };

  if (status === "accepted") {
    updateData.acceptedAt = new Date();
  } else if (status === "revoked") {
    updateData.revokedAt = new Date();
  }

  const updatedInvite = await db
    .update(invite)
    .set(updateData)
    .where(eq(invite.id, inviteId))
    .returning()
    .then((rows) => rows[0]);

  if (!updatedInvite) {
    return { success: false, message: ERRORS.FAILED_TO_UPDATE };
  }

  return { success: true, data: updatedInvite };
};

export const revokeInviteDAL = async (
  inviteId: string,
): Promise<UpdateInviteResult> => {
  return updateInviteStatusDAL(inviteId, "revoked");
};

export const getInviteByTenantIdDAL = cache(
  async (tenantId: string): Promise<GetInviteResult> => {
    const sessionPromise = verifySessionDAL();
    const queryPromise = db
      .select({
        invite: invite,
        property: property,
        tenant: tenant,
      })
      .from(invite)
      .leftJoin(property, eq(invite.propertyId, property.id))
      .leftJoin(tenant, eq(invite.tenantId, tenant.id))
      .where(eq(invite.tenantId, tenantId))
      .orderBy(desc(invite.createdAt))
      .limit(1);

    const session = await sessionPromise;
    if (!session) {
      return { success: false, message: ERRORS.NOT_SIGNED_IN_VIEW };
    }

    const hasPermission = await canViewInvite(
      session.user.id,
      session.user.role as Roles,
    );

    if (!hasPermission) {
      return { success: false, message: ERRORS.NO_VIEW_PERMISSION };
    }

    const results = await queryPromise;
    const result = results[0];

    if (!result) {
      return { success: true, data: undefined };
    }

    // Verify ownership
    if (result.invite.organizationId !== session.user.id) {
      return { success: false, message: ERRORS.NO_VIEW_THIS_INVITE };
    }

    return { success: true, data: buildInviteWithDetails(result) };
  },
);

export const linkTenantToUserDAL = async (
  tenantId: string,
  userId: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await db
      .update(tenant)
      .set({ userId })
      .where(eq(tenant.id, tenantId))
      .returning()
      .then((rows) => rows[0]);

    if (!result) {
      return {
        success: false,
        message: "Failed to link tenant to user account.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error linking tenant to user:", error);
    return {
      success: false,
      message: "An error occurred while linking tenant to user account.",
    };
  }
};
