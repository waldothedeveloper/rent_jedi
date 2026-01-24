"server only";

import { and, desc, eq, isNull } from "drizzle-orm";

import type { Roles } from "@/types/roles";
import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { property } from "@/db/schema/properties-schema";
import { tenant } from "@/db/schema/tenants-schema";
import { unit } from "@/db/schema/units-schema";
import { verifySessionDAL } from "@/dal/properties";

/*

TYPE DEFINITIONS BELOW

*/
type TenantUpdate = Partial<
  Omit<typeof tenant.$inferInsert, "id" | "createdAt" | "updatedAt">
>;
type GuardResult = { success: true } | { success: false; message: string };
type TenantStatus = (typeof tenant.$inferInsert)["tenantStatus"];

export type TenantWithDetails = typeof tenant.$inferSelect & {
  unit?: typeof unit.$inferSelect | null;
  property?: typeof property.$inferSelect | null;
};

const ERRORS = {
  NOT_SIGNED_IN: "⛔️ Access Denied. You must be signed in.",
  NO_CREATE_PERMISSION:
    "⛔️ Access Denied. You do not have permission to create a tenant.",
  NO_UPDATE_PERMISSION:
    "⛔️ Access Denied. You do not have permission to update a tenant.",
  NO_VIEW_PERMISSION:
    "⛔️ Access Denied. You do not have permission to view a tenant.",
  NO_LIST_PERMISSION:
    "⛔️ Access Denied. You do not have permission to list tenants.",
  NO_ACTIVATE_PERMISSION:
    "⛔️ Access Denied. You do not have permission to activate a tenant.",
  NO_ARCHIVE_PERMISSION:
    "⛔️ Access Denied. You do not have permission to archive a tenant.",
  TENANT_NOT_FOUND: "Tenant not found.",
  NOT_TENANT_OWNER:
    "⛔️ Access Denied. You do not have permission to access this tenant.",
  NOT_DRAFT_STATUS: "Cannot update tenant where status is not draft.",
  NOT_DRAFT_ACTIVATE: "Cannot activate a tenant that is not in draft status.",
  EMAIL_OR_PHONE_REQUIRED:
    "Either email or phone is required. Please provide at least one of them.",
  UNIT_HAS_ACTIVE_TENANT: "This unit already has an active tenant.",
  FAILED_TO_CREATE: "Failed to create tenant draft.",
  FAILED_TO_UPDATE: "Failed to update tenant draft.",
  FAILED_TO_ACTIVATE: "Failed to activate tenant.",
  FAILED_TO_FETCH: "Failed to fetch tenant.",
  FAILED_TO_LIST: "Failed to fetch tenants.",
  FAILED_TO_ARCHIVE: "Failed to archive tenant.",
} as const;

/*

ONLY PERMISSION CHECK FUNCTIONS BELOW

*/

export const canViewTenant = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        tenant: ["view"],
      },
    },
  });

  return permissionCheck.success;
});

export const canListTenants = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        tenant: ["list"],
      },
    },
  });

  return permissionCheck.success;
});

export const canCreateTenant = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        tenant: ["create"],
      },
    },
  });

  return permissionCheck.success;
});

export const canUpdateTenant = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        tenant: ["update"],
      },
    },
  });

  return permissionCheck.success;
});

export const canDeleteTenant = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        tenant: ["delete"],
      },
    },
  });

  return permissionCheck.success;
});

/*

ADDITIONAL HELPER FUNCTIONS


*/

const verifyUnitOwnershipForTenant = async (
  unitId?: string | null,
  ownerId?: string | null,
  options?: {
    notFoundMessage?: string;
    notOwnerMessage?: string;
  }
): Promise<GuardResult> => {
  const notFoundMessage = options?.notFoundMessage ?? "Unit not found.";
  const notOwnerMessage =
    options?.notOwnerMessage ?? "⛔️ Access Denied. You do not own this unit.";

  if (!unitId) {
    return {
      success: false,
      message: "Please provide a valid unit ID.",
    };
  }

  if (!ownerId) {
    return {
      success: false,
      message: "Please provide a valid owner ID.",
    };
  }

  const unitOwnership = await db
    .select({
      unitId: unit.id,
      propertyId: unit.propertyId,
      ownerId: property.ownerId,
    })
    .from(unit)
    .innerJoin(property, eq(unit.propertyId, property.id))
    .where(eq(unit.id, unitId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!unitOwnership) {
    return {
      success: false,
      message: notFoundMessage,
    };
  }

  if (unitOwnership.ownerId !== ownerId) {
    return {
      success: false,
      message: notOwnerMessage,
    };
  }

  return { success: true };
};

const ensureUnitHasNoActiveTenant = async (
  unitId?: string | null,
  options?: {
    tenantStatus?: TenantStatus;
    message?: string;
  }
): Promise<GuardResult> => {
  if (!unitId) {
    return {
      success: false,
      message: "Please provide a valid unit ID.",
    };
  }

  const message =
    options?.message ??
    "This unit already has an active tenant. Please end their lease first.";
  const condition = options?.tenantStatus
    ? and(
        eq(tenant.unitId, unitId),
        isNull(tenant.leaseEndDate),
        eq(tenant.tenantStatus, options.tenantStatus)
      )
    : and(eq(tenant.unitId, unitId), isNull(tenant.leaseEndDate));

  const existingTenant = await db
    .select()
    .from(tenant)
    .where(condition)
    .limit(1)
    .then((rows) => rows[0]);

  if (existingTenant) {
    return {
      success: false,
      message,
    };
  }

  return { success: true };
};

/*

ONLY DAL FUNCTIONS BELOW

*/

/**
 * Create a tenant draft with Step 1 data (name, email, phone)
 * Draft pattern for security: Store PII in database instead of localStorage
 */
export const createTenantDraftDAL = async (data: {
    name: string;
    email?: string | null;
    phone?: string | null;
  }): Promise<{
    success: boolean;
    data?: typeof tenant.$inferSelect;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    if (!(await canCreateTenant(session.user.id, session.user.role as Roles))) {
      return {
        success: false as const,
        message: ERRORS.NO_CREATE_PERMISSION,
      };
    }

    try {
      if (!data.email && !data.phone) {
        return {
          success: false,
          message: ERRORS.EMAIL_OR_PHONE_REQUIRED,
        };
      }

      const [createdTenant] = await db
        .insert(tenant)
        .values({
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          tenantStatus: "draft",
          ownerId: session.user.id,
        })
        .returning();

      return { success: true, data: createdTenant };
    } catch (error) {
      console.error("[createTenantDraftDAL] Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERRORS.FAILED_TO_CREATE,
      };
    }
  };

/**
 * Update tenant draft with incremental data (Step 2: lease dates)
 */
export const updateTenantDraftDAL = async (
    tenantId: string,
    data: TenantUpdate
  ): Promise<{
    success: boolean;
    data?: typeof tenant.$inferSelect;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and tenant existence check in parallel
      const [hasPermission, existingTenant] = await Promise.all([
        canUpdateTenant(session.user.id, session.user.role as Roles),
        db
          .select()
          .from(tenant)
          .where(eq(tenant.id, tenantId))
          .limit(1)
          .then((rows) => rows[0]),
      ]);

      if (!hasPermission) {
        return {
          success: false as const,
          message: ERRORS.NO_UPDATE_PERMISSION,
        };
      }

      if (!existingTenant) {
        return { success: false, message: ERRORS.TENANT_NOT_FOUND };
      }

      if (existingTenant.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_TENANT_OWNER,
        };
      }

      if (existingTenant.tenantStatus !== "draft") {
        return {
          success: false,
          message: ERRORS.NOT_DRAFT_STATUS,
        };
      }

      const [updatedTenant] = await db
        .update(tenant)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(tenant.id, tenantId))
        .returning();

      return { success: true, data: updatedTenant };
    } catch (error) {
      console.error("[updateTenantDraftDAL] Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERRORS.FAILED_TO_UPDATE,
      };
    }
  };

export const activateTenantDraftDAL = async (
    tenantId: string,
    unitId: string
  ): Promise<{
    success: boolean;
    data?: typeof tenant.$inferSelect;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check, unit ownership, tenant fetch, and availability check in parallel
      const [hasPermission, ownershipResult, existingTenant, availabilityResult] =
        await Promise.all([
          canCreateTenant(session.user.id, session.user.role as Roles),
          verifyUnitOwnershipForTenant(unitId, session.user.id, {
            notFoundMessage: ERRORS.NOT_SIGNED_IN,
            notOwnerMessage: ERRORS.NOT_SIGNED_IN,
          }),
          db
            .select()
            .from(tenant)
            .where(eq(tenant.id, tenantId))
            .limit(1)
            .then((rows) => rows[0]),
          ensureUnitHasNoActiveTenant(unitId, {
            tenantStatus: "active",
            message: ERRORS.UNIT_HAS_ACTIVE_TENANT,
          }),
        ]);

      if (!hasPermission) {
        return {
          success: false as const,
          message: ERRORS.NO_ACTIVATE_PERMISSION,
        };
      }

      if (!ownershipResult.success) {
        return ownershipResult;
      }

      if (!existingTenant) {
        return { success: false, message: ERRORS.TENANT_NOT_FOUND };
      }

      if (existingTenant.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_TENANT_OWNER,
        };
      }

      if (existingTenant.tenantStatus !== "draft") {
        return {
          success: false,
          message: ERRORS.NOT_DRAFT_ACTIVATE,
        };
      }

      if (!availabilityResult.success) {
        return availabilityResult;
      }

      const [activatedTenant] = await db
        .update(tenant)
        .set({
          unitId,
          tenantStatus: "active",
          updatedAt: new Date(),
        })
        .where(eq(tenant.id, tenantId))
        .returning();

      return { success: true, data: activatedTenant };
    } catch (error) {
      console.error("[activateTenantDraftDAL] Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERRORS.FAILED_TO_ACTIVATE,
      };
    }
  };

/**
 * Get tenant by ID with ownership verification
 */
export const getTenantByIdDAL = cache(
  async (
    tenantId: string
  ): Promise<{
    success: boolean;
    data?: typeof tenant.$inferSelect & {
      unit?: typeof unit.$inferSelect | null;
      property?: typeof property.$inferSelect | null;
    };
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and query in parallel
      const [hasPermission, result] = await Promise.all([
        canViewTenant(session.user.id, session.user.role as Roles),
        db
          .select({
            tenant: tenant,
            unit: unit,
            property: property,
          })
          .from(tenant)
          .leftJoin(unit, eq(tenant.unitId, unit.id)) // LEFT JOIN for drafts without unitId
          .leftJoin(property, eq(unit.propertyId, property.id))
          .where(eq(tenant.id, tenantId))
          .limit(1)
          .then((rows) => rows[0]),
      ]);

      if (!hasPermission) {
        return {
          success: false as const,
          message: ERRORS.NO_VIEW_PERMISSION,
        };
      }

      if (!result) {
        return {
          success: false,
          message: ERRORS.TENANT_NOT_FOUND,
        };
      }

      // Verify ownership for all tenant records (drafts and active)
      if (result.tenant.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_TENANT_OWNER,
        };
      }

      return {
        success: true,
        data: {
          ...result.tenant,
          unit: result.unit,
          property: result.property,
        },
      };
    } catch (error) {
      console.error("[getTenantByIdDAL] Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERRORS.FAILED_TO_FETCH,
      };
    }
  }
);

/**
 * Update tenant (works for any status)
 * Allows owner to update tenant information regardless of status
 */
export const updateTenantDAL = async (
  tenantId: string,
  data: TenantUpdate
): Promise<{
  success: boolean;
  data?: typeof tenant.$inferSelect;
  message?: string;
}> => {
  const session = await verifySessionDAL();

  if (!session) {
    return {
      success: false,
      message: ERRORS.NOT_SIGNED_IN,
    };
  }

  try {
    // Run permission check and tenant existence check in parallel
    const [hasPermission, existingTenant] = await Promise.all([
      canUpdateTenant(session.user.id, session.user.role as Roles),
      db
        .select()
        .from(tenant)
        .where(eq(tenant.id, tenantId))
        .limit(1)
        .then((rows) => rows[0]),
    ]);

    if (!hasPermission) {
      return {
        success: false as const,
        message: ERRORS.NO_UPDATE_PERMISSION,
      };
    }

    if (!existingTenant) {
      return { success: false, message: ERRORS.TENANT_NOT_FOUND };
    }

    if (existingTenant.ownerId !== session.user.id) {
      return {
        success: false,
        message: ERRORS.NOT_TENANT_OWNER,
      };
    }

    // Validate email or phone requirement
    const updatedEmail = data.email !== undefined ? data.email : existingTenant.email;
    const updatedPhone = data.phone !== undefined ? data.phone : existingTenant.phone;

    if (!updatedEmail && !updatedPhone) {
      return {
        success: false,
        message: ERRORS.EMAIL_OR_PHONE_REQUIRED,
      };
    }

    const [updatedTenant] = await db
      .update(tenant)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tenant.id, tenantId))
      .returning();

    return { success: true, data: updatedTenant };
  } catch (error) {
    console.error("[updateTenantDAL] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : ERRORS.FAILED_TO_UPDATE,
    };
  }
};

/**
 * List all tenants for the current owner
 * Includes drafts, active, archived, and inactive tenants
 * Returns tenant with associated unit and property information
 */
export const listTenantsDAL = cache(
  async (): Promise<{
    success: boolean;
    data?: Array<
      typeof tenant.$inferSelect & {
        unit?: typeof unit.$inferSelect | null;
        property?: typeof property.$inferSelect | null;
      }
    >;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and query in parallel
      const [hasPermission, results] = await Promise.all([
        canListTenants(session.user.id, session.user.role as Roles),
        db
          .select({
            tenant: tenant,
            unit: unit,
            property: property,
          })
          .from(tenant)
          .leftJoin(unit, eq(tenant.unitId, unit.id)) // LEFT JOIN for drafts without unitId
          .leftJoin(property, eq(unit.propertyId, property.id))
          .where(eq(tenant.ownerId, session.user.id)) // Filter by owner
          .orderBy(desc(tenant.createdAt)), // Most recent first
      ]);

      if (!hasPermission) {
        return {
          success: false,
          message: ERRORS.NO_LIST_PERMISSION,
        };
      }

      const formattedResults = results.map((row) => ({
        ...row.tenant,
        unit: row.unit,
        property: row.property,
      }));

      return {
        success: true,
        data: formattedResults,
      };
    } catch (error) {
      console.error("[listTenantsDAL] Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : ERRORS.FAILED_TO_LIST,
      };
    }
  }
);

/**
 * Archive tenant
 * Sets tenant status to 'archived' and ends lease
 * Preserves all associated data (payments, maintenance requests, invites)
 */
export const archiveTenantDAL = async (
  tenantId: string
): Promise<{
  success: boolean;
  message?: string;
}> => {
  const session = await verifySessionDAL();

  if (!session) {
    return {
      success: false,
      message: ERRORS.NOT_SIGNED_IN,
    };
  }

  try {
    // Run permission check and tenant fetch in parallel
    const [hasPermission, existingTenant] = await Promise.all([
      canDeleteTenant(session.user.id, session.user.role as Roles),
      db
        .select()
        .from(tenant)
        .where(eq(tenant.id, tenantId))
        .limit(1)
        .then((rows) => rows[0]),
    ]);

    // Permission check (reusing canDeleteTenant for archive permission)
    if (!hasPermission) {
      return {
        success: false,
        message: ERRORS.NO_ARCHIVE_PERMISSION,
      };
    }

    // Existence check
    if (!existingTenant) {
      return {
        success: false,
        message: ERRORS.TENANT_NOT_FOUND,
      };
    }

    // Ownership verification
    if (existingTenant.ownerId !== session.user.id) {
      return {
        success: false,
        message: ERRORS.NOT_TENANT_OWNER,
      };
    }

    // Check if already archived
    if (existingTenant.tenantStatus === "archived") {
      return {
        success: false,
        message: "Tenant is already archived",
      };
    }

    // Archive the tenant
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );
    const updateData: {
      tenantStatus: "archived";
      leaseEndDate?: Date;
      updatedAt: Date;
    } = {
      tenantStatus: "archived",
      updatedAt: today,
    };

    // Set lease end date if not already set
    if (!existingTenant.leaseEndDate) {
      // If lease hasn't started yet (start date is in the future or today),
      // set end date to 1 day after start to satisfy the constraint (end > start)
      if (existingTenant.leaseStartDate && existingTenant.leaseStartDate >= todayUTC) {
        const oneDayAfterStart = new Date(existingTenant.leaseStartDate);
        oneDayAfterStart.setUTCDate(oneDayAfterStart.getUTCDate() + 1);
        updateData.leaseEndDate = oneDayAfterStart;
      } else {
        // Lease already started in the past, so today > start (satisfies constraint)
        updateData.leaseEndDate = todayUTC;
      }
    }

    await db
      .update(tenant)
      .set(updateData)
      .where(eq(tenant.id, tenantId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("[archiveTenantDAL] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : ERRORS.FAILED_TO_ARCHIVE,
    };
  }
};
