"server only";

import { and, eq, isNull } from "drizzle-orm";

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
type Tenant = typeof tenant.$inferInsert;
type TenantUpdate = Partial<
  Omit<typeof tenant.$inferInsert, "id" | "createdAt" | "updatedAt">
>;
type GuardResult = { success: true } | { success: false; message: string };
type TenantStatus = (typeof tenant.$inferInsert)["tenantStatus"];

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

export const createTenantDAL = cache(
  async (
    data: Tenant
  ): Promise<{
    success: boolean;
    data?: typeof tenant.$inferSelect;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied. You must be signed in to create a tenant.",
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
      const ownershipResult = await verifyUnitOwnershipForTenant(
        data.unitId,
        session.user.id
      );

      if (!ownershipResult.success) {
        return ownershipResult;
      }

      const availabilityResult = await ensureUnitHasNoActiveTenant(data.unitId);

      if (!availabilityResult.success) {
        return availabilityResult;
      }

      const [createdTenant] = await db.insert(tenant).values(data).returning();

      return {
        success: true,
        data: createdTenant,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check for constraint violations
      if (errorMessage.includes("tenant_unit_active_uid")) {
        return {
          success: false,
          message: "This unit already has an active tenant.",
        };
      }

      if (errorMessage.includes("tenant_contact_method_required")) {
        return {
          success: false,
          message: "Either email or phone is required.",
        };
      }

      return {
        success: false,
        message: "Failed to create tenant. Please try again.",
      };
    }
  }
);

/**
 * Create a tenant draft with Step 1 data (name, email, phone)
 * Draft pattern for security: Store PII in database instead of localStorage
 */
export const createTenantDraftDAL = cache(
  async (data: {
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
        })
        .returning();

      return { success: true, data: createdTenant };
    } catch (error) {
      console.error("[createTenantDraftDAL] Error:", error);
      return { success: false, message: "Failed to create tenant draft." };
    }
  }
);

/**
 * Update tenant draft with incremental data (Step 2: lease dates)
 */
export const updateTenantDraftDAL = cache(
  async (
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
      return { success: false, message: "Failed to update tenant draft." };
    }
  }
);

export const activateTenantDraftDAL = cache(
  async (
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
      return { success: false, message: "Failed to activate tenant." };
    }
  }
);

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

      // For drafts without units, no ownership check needed
      // For active tenants, verify ownership
      if (result.property && result.property.ownerId !== session.user.id) {
        return {
          success: false,
          message: "⛔️ Access Denied.",
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
      return {
        success: false,
        message: "Failed to fetch tenant.",
      };
    }
  }
);
