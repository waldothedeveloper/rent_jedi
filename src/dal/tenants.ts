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
        message: "⛔️ Access Denied. You must be signed in.",
      };
    }

    if (!(await canCreateTenant(session.user.id, session.user.role as Roles))) {
      return {
        success: false as const,
        message:
          "⛔️ Access Denied. You do not have permission to create a tenant.",
      };
    }

    try {
      if (!data.email && !data.phone) {
        return {
          success: false,
          message:
            "Either email or phone is required. Please provide at least one of them.",
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
        message:
          error instanceof Error
            ? error.message
            : "Failed to create tenant draft.",
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
        message: "⛔️ Access Denied.",
      };
    }

    if (!(await canUpdateTenant(session.user.id, session.user.role as Roles))) {
      return {
        success: false as const,
        message:
          "⛔️ Access Denied. You do not have permission to update a tenant.",
      };
    }

    try {
      const existingTenant = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, tenantId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingTenant) {
        return { success: false, message: "Tenant not found." };
      }

      if (existingTenant.ownerId !== session.user.id) {
        return {
          success: false,
          message:
            "⛔️ Access Denied. You do not have permission to update this tenant.",
        };
      }

      if (existingTenant.tenantStatus !== "draft") {
        return {
          success: false,
          message: "Cannot update tenant where status is not draft.",
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
        message:
          error instanceof Error
            ? error.message
            : "Failed to update tenant draft.",
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
        message: "⛔️ Access Denied.",
      };
    }

    if (!(await canCreateTenant(session.user.id, session.user.role as Roles))) {
      return {
        success: false as const,
        message:
          "⛔️ Access Denied. You do not have permission to activate a tenant.",
      };
    }

    try {
      const ownershipResult = await verifyUnitOwnershipForTenant(
        unitId,
        session.user.id,
        {
          notFoundMessage: "⛔️ Access Denied.",
          notOwnerMessage: "⛔️ Access Denied.",
        }
      );

      if (!ownershipResult.success) {
        return ownershipResult;
      }

      // Verify tenant ownership
      const existingTenant = await db
        .select()
        .from(tenant)
        .where(eq(tenant.id, tenantId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingTenant) {
        return { success: false, message: "Tenant not found." };
      }

      if (existingTenant.ownerId !== session.user.id) {
        return {
          success: false,
          message: "⛔️ Access Denied.",
        };
      }

      if (existingTenant.tenantStatus !== "draft") {
        return {
          success: false,
          message: "Cannot activate a tenant that is not in draft status.",
        };
      }

      const availabilityResult = await ensureUnitHasNoActiveTenant(unitId, {
        tenantStatus: "active",
        message: "This unit already has an active tenant.",
      });

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
        message:
          error instanceof Error ? error.message : "Failed to activate tenant.",
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
        message: "⛔️ Access Denied. You must be signed in.",
      };
    }

    if (!(await canViewTenant(session.user.id, session.user.role as Roles))) {
      return {
        success: false as const,
        message:
          "⛔️ Access Denied. You do not have permission to view a tenant.",
      };
    }

    try {
      const result = await db
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
        .then((rows) => rows[0]);

      if (!result) {
        return {
          success: false,
          message: "Tenant not found.",
        };
      }

      // Verify ownership for all tenant records (drafts and active)
      if (result.tenant.ownerId !== session.user.id) {
        return {
          success: false,
          message:
            "⛔️ Access Denied. You cannot see tenants that do not belong to you.",
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
        message:
          error instanceof Error ? error.message : "Failed to fetch tenant.",
      };
    }
  }
);

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
        message: "⛔️ Access Denied. You must be signed in.",
      };
    }

    if (!(await canListTenants(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to list tenants.",
      };
    }

    try {
      const results = await db
        .select({
          tenant: tenant,
          unit: unit,
          property: property,
        })
        .from(tenant)
        .leftJoin(unit, eq(tenant.unitId, unit.id)) // LEFT JOIN for drafts without unitId
        .leftJoin(property, eq(unit.propertyId, property.id))
        .where(eq(tenant.ownerId, session.user.id)) // Filter by owner
        .orderBy(desc(tenant.createdAt)); // Most recent first

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
        message:
          error instanceof Error ? error.message : "Failed to fetch tenants.",
      };
    }
  }
);
