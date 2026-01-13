"server only";

import { and, count, eq, isNull, sql } from "drizzle-orm";

import type { Roles } from "@/types/roles";
import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { headers } from "next/headers";
import { property } from "@/db/schema/properties-schema";
import { tenant } from "@/db/schema/tenants-schema";
import { unit } from "@/db/schema/units-schema";

/*

TYPE DEFINITIONS BELOW

*/

type Property = typeof property.$inferInsert;
type Unit = typeof unit.$inferInsert;
type CreateProperty =
  | {
      success: true;
      data: Property;
    }
  | {
      success: false;
      message: string;
    };

/*

ONLY PERMISSION CHECK FUNCTIONS BELOW

*/

export const canViewProperty = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        property: ["view"],
      },
    },
  });

  return permissionCheck.success;
});

export const canListProperties = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        property: ["list"],
      },
    },
  });

  return permissionCheck.success;
});

export const canCreateProperty = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        property: ["create"],
      },
    },
  });

  return permissionCheck.success;
});

export const canCreateUnit = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        unit: ["create"],
      },
    },
  });

  return permissionCheck.success;
});

export const canUpdateProperty = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        property: ["update"],
      },
    },
  });

  return permissionCheck.success;
});

export const canDeleteProperty = cache(async (userId: string, role: Roles) => {
  const permissionCheck = await auth.api.userHasPermission({
    body: {
      userId,
      role,
      permission: {
        property: ["delete"],
      },
    },
  });

  return permissionCheck.success;
});

/*

ONLY DAL FUNCTIONS BELOW

*/

export const verifySessionDAL = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

export const createPropertyDAL = cache(
  async (data: Property): Promise<CreateProperty> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false as const,
        message:
          "⛔️ Access Denied. You must be signed in to create a property.",
      };
    }

    if (
      !(await canCreateProperty(session.user.id, session.user.role as Roles))
    ) {
      return {
        success: false as const,
        message:
          "⛔️ Access Denied. You do not have permission to create a property.",
      };
    }

    try {
      const [createdProperty] = await db
        .insert(property)
        .values(data)
        .returning();

      return {
        success: true as const,
        data: createdProperty,
      };
    } catch (error) {
      // ("Error creating property:", error);
      return {
        success: false as const,
        message:
          "Ups! Something went wrong while creating the property. Please try again or contact support.",
      };
    }
  }
);

export const listPropertiesDAL = cache(async () => {
  const session = await verifySessionDAL();

  if (!session) {
    return {
      success: false as const,
      message: "⛔️ Access Denied. You must be signed in to list properties.",
    };
  }

  if (!(await canListProperties(session.user.id, session.user.role as Roles))) {
    return {
      success: false,
      message:
        "⛔️ Access Denied. You do not have permission to list properties.",
    };
  }

  try {
    // Fetch properties with unit counts using LEFT JOIN
    const properties = await db
      .select({
        id: property.id,
        ownerId: property.ownerId,
        name: property.name,
        description: property.description,
        propertyStatus: property.propertyStatus,
        contactEmail: property.contactEmail,
        contactPhone: property.contactPhone,
        propertyType: property.propertyType,
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        city: property.city,
        state: property.state,
        unitType: property.unitType,
        zipCode: property.zipCode,
        country: property.country,
        yearBuilt: property.yearBuilt,
        buildingSqFt: property.buildingSqFt,
        lotSqFt: property.lotSqFt,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
        unitsCount: count(unit.id),
        bedrooms: sql<number | null>`MAX(${unit.bedrooms})`,
        bathrooms: sql<number | null>`MAX(${unit.bathrooms})`,
      })
      .from(property)
      .leftJoin(unit, eq(property.id, unit.propertyId))
      .where(eq(property.ownerId, session.user.id))
      .groupBy(property.id);

    return {
      success: true as const,
      data: properties,
    };
  } catch (error) {
    // ("Error listing properties:", error);
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to list properties. Please try again.",
    };
  }
});

export const getPropertyByIdDAL = cache(
  async (
    propertyId: string
  ): Promise<{
    success: boolean;
    data?: typeof property.$inferSelect & {
      units: (typeof unit.$inferSelect)[];
    };
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied. You must be signed in to view a property.",
      };
    }

    if (!(await canViewProperty(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to view this property.",
      };
    }

    try {
      // Fetch the property
      const propertyRecord = await db
        .select()
        .from(property)
        .where(eq(property.id, propertyId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!propertyRecord) {
        return {
          success: false,
          message: "Property not found.",
        };
      }

      // Fetch all units that belong to this property
      const units = await db
        .select()
        .from(unit)
        .where(eq(unit.propertyId, propertyId));

      return {
        success: true,
        data: {
          ...propertyRecord,
          units,
        },
      };
    } catch (error) {
      // ("Error fetching property by ID:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch property. Please try again.",
      };
    }
  }
);

export const createUnitDAL = cache(
  async (
    data: Unit
  ): Promise<{
    success: boolean;
    data?: Unit;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied. You must be signed in to create a unit.",
      };
    }

    if (!(await canCreateUnit(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to create a unit.",
      };
    }

    try {
      const [createdUnit] = await db.insert(unit).values(data).returning();

      return {
        success: true,
        data: createdUnit,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create unit. Please try again.",
      };
    }
  }
);

export const createUnitsDAL = cache(
  async (
    unitsData: (typeof unit.$inferInsert)[]
  ): Promise<{
    success: boolean;
    data?: (typeof unit.$inferSelect)[];
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied. You must be signed in to create units.",
      };
    }

    if (!(await canCreateUnit(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to create units.",
      };
    }

    try {
      // Batch insert all units
      const createdUnits = await db.insert(unit).values(unitsData).returning();

      return {
        success: true,
        data: createdUnits,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Detect unique constraint violations
      if (
        errorMessage.includes("23505") ||
        errorMessage.includes("unique constraint") ||
        errorMessage.includes("duplicate key")
      ) {
        return {
          success: false,
          message:
            "A unit with this name already exists for this property. Please choose a different name.",
        };
      }

      return {
        success: false,
        message: errorMessage || "Failed to create units. Please try again.",
      };
    }
  }
);

export const updatePropertyDraftDAL = cache(
  async (
    propertyId: string,
    data: Partial<typeof property.$inferInsert>
  ): Promise<{
    success: boolean;
    data?: typeof property.$inferSelect;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You must be signed in to update a property.",
      };
    }

    if (
      !(await canUpdateProperty(session.user.id, session.user.role as Roles))
    ) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to update a property.",
      };
    }

    try {
      const existingProperty = await db
        .select()
        .from(property)
        .where(eq(property.id, propertyId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingProperty) {
        return {
          success: false,
          message:
            "The property you are trying to update does not belongs to this user or does not exist.",
        };
      }

      if (existingProperty.ownerId !== session.user.id) {
        return {
          success: false,
          message:
            "⛔️ Access Denied. You do not have permission to update this property.",
        };
      }

      // Update the property
      const [updatedProperty] = await db
        .update(property)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(property.id, propertyId))
        .returning();

      return {
        success: true,
        data: updatedProperty,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update property. Please try again.",
      };
    }
  }
);

export const getDraftPropertyByOwnerDAL = cache(
  async (): Promise<{
    success: boolean;
    data?: {
      property: typeof property.$inferSelect;
      unitsCount: number;
    };
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You must be signed in to get draft property.",
      };
    }

    try {
      // Fetch user's draft property with unit count
      const result = await db
        .select({
          id: property.id,
          ownerId: property.ownerId,
          name: property.name,
          description: property.description,
          propertyStatus: property.propertyStatus,
          contactEmail: property.contactEmail,
          contactPhone: property.contactPhone,
          propertyType: property.propertyType,
          addressLine1: property.addressLine1,
          addressLine2: property.addressLine2,
          city: property.city,
          state: property.state,
          unitType: property.unitType,
          zipCode: property.zipCode,
          country: property.country,
          yearBuilt: property.yearBuilt,
          buildingSqFt: property.buildingSqFt,
          lotSqFt: property.lotSqFt,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          unitsCount: count(unit.id),
        })
        .from(property)
        .leftJoin(unit, eq(property.id, unit.propertyId))
        .where(
          sql`${property.ownerId} = ${session.user.id} AND ${property.propertyStatus} = 'draft'`
        )
        .groupBy(property.id)
        .limit(1);

      if (result.length === 0) {
        return {
          success: true,
          data: undefined,
        };
      }

      const { unitsCount, ...propertyData } = result[0];

      return {
        success: true,
        data: {
          property: propertyData,
          unitsCount: Number(unitsCount),
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch draft property. Please try again.",
      };
    }
  }
);

export const getPropertyWithUnitsCountDAL = cache(
  async (
    propertyId: string
  ): Promise<{
    success: boolean;
    data?: {
      property: typeof property.$inferSelect;
      unitsCount: number;
    };
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied. You must be signed in to view property.",
      };
    }

    if (!(await canViewProperty(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to view this property.",
      };
    }

    try {
      // Fetch property with unit count
      const result = await db
        .select({
          id: property.id,
          ownerId: property.ownerId,
          name: property.name,
          description: property.description,
          propertyStatus: property.propertyStatus,
          contactEmail: property.contactEmail,
          contactPhone: property.contactPhone,
          propertyType: property.propertyType,
          addressLine1: property.addressLine1,
          addressLine2: property.addressLine2,
          city: property.city,
          state: property.state,
          unitType: property.unitType,
          zipCode: property.zipCode,
          country: property.country,
          yearBuilt: property.yearBuilt,
          buildingSqFt: property.buildingSqFt,
          lotSqFt: property.lotSqFt,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          unitsCount: count(unit.id),
        })
        .from(property)
        .leftJoin(unit, eq(property.id, unit.propertyId))
        .where(eq(property.id, propertyId))
        .groupBy(property.id)
        .limit(1);

      if (result.length === 0) {
        return {
          success: false,
          message: "Property not found.",
        };
      }

      const { unitsCount, ...propertyData } = result[0];

      // Verify ownership
      if (propertyData.ownerId !== session.user.id) {
        return {
          success: false,
          message:
            "⛔️ Access Denied. You do not have permission to view this property.",
        };
      }

      return {
        success: true,
        data: {
          property: propertyData,
          unitsCount: Number(unitsCount),
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch property. Please try again.",
      };
    }
  }
);

export const updateUnitDAL = cache(
  async (
    unitId: string,
    data: Partial<typeof unit.$inferInsert>
  ): Promise<{
    success: boolean;
    data?: typeof unit.$inferSelect;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied. You must be signed in to update a unit.",
      };
    }

    // Verify permission
    if (!(await canCreateUnit(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to update units.",
      };
    }

    try {
      // Verify the unit belongs to a property owned by this user
      const existingUnit = await db
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

      if (!existingUnit) {
        return {
          success: false,
          message: "Unit not found.",
        };
      }

      if (existingUnit.ownerId !== session.user.id) {
        return {
          success: false,
          message:
            "⛔️ Access Denied. You do not have permission to update this unit.",
        };
      }

      // Update the unit
      const [updatedUnit] = await db
        .update(unit)
        .set(data)
        .where(eq(unit.id, unitId))
        .returning();

      return {
        success: true,
        data: updatedUnit,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update unit. Please try again.",
      };
    }
  }
);

export const deletePropertyDAL = cache(
  async (
    propertyId: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You must be signed in to delete a property.",
      };
    }

    if (
      !(await canDeleteProperty(session.user.id, session.user.role as Roles))
    ) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You do not have permission to delete a property.",
      };
    }

    try {
      const existingProperty = await db
        .select()
        .from(property)
        .where(eq(property.id, propertyId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!existingProperty) {
        return {
          success: false,
          message:
            "The property you are trying to delete does not exist or does not belong to this user.",
        };
      }

      if (existingProperty.ownerId !== session.user.id) {
        return {
          success: false,
          message:
            "⛔️ Access Denied. You do not have permission to delete this property.",
        };
      }

      await db.delete(property).where(eq(property.id, propertyId));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete property. Please try again.",
      };
    }
  }
);

/**
 * Get all properties with available unit counts for tenant creation dropdown
 */
export const getPropertiesWithAvailableUnitsDAL = cache(
  async (): Promise<{
    success: boolean;
    data?: Array<{
      property: typeof property.$inferSelect;
      totalUnits: number;
      availableUnits: number;
    }>;
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied.",
      };
    }

    try {
      const results = await db
        .select({
          property: property,
          unitId: unit.id,
          hasTenant: sql<boolean>`EXISTS (
            SELECT 1 FROM tenant t
            WHERE t.unit_id = ${unit.id}
            AND t.lease_end_date IS NULL
          )`,
        })
        .from(property)
        .leftJoin(unit, eq(property.id, unit.propertyId))
        .where(eq(property.ownerId, session.user.id));

      // Group by property and calculate available units
      const propertyMap = new Map();

      results.forEach((row) => {
        const propId = row.property.id;
        if (!propertyMap.has(propId)) {
          propertyMap.set(propId, {
            property: row.property,
            totalUnits: 0,
            availableUnits: 0,
          });
        }

        if (row.unitId) {
          const data = propertyMap.get(propId);
          data.totalUnits++;
          if (!row.hasTenant) {
            data.availableUnits++;
          }
        }
      });

      return {
        success: true,
        data: Array.from(propertyMap.values()),
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch properties.",
      };
    }
  }
);

/**
 * Get available units for a property (no active tenants)
 */
export const getAvailableUnitsByPropertyDAL = cache(
  async (
    propertyId: string
  ): Promise<{
    success: boolean;
    data?: (typeof unit.$inferSelect)[];
    message?: string;
  }> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false,
        message: "⛔️ Access Denied.",
      };
    }

    try {
      // Verify ownership
      const propertyRecord = await db
        .select()
        .from(property)
        .where(eq(property.id, propertyId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!propertyRecord) {
        return {
          success: false,
          message: "Property not found.",
        };
      }

      if (propertyRecord.ownerId !== session.user.id) {
        return {
          success: false,
          message: "⛔️ Access Denied.",
        };
      }

      // Get units without active tenants
      const availableUnits = await db
        .select({
          unit: unit,
        })
        .from(unit)
        .leftJoin(
          tenant,
          and(eq(unit.id, tenant.unitId), isNull(tenant.leaseEndDate))
        )
        .where(and(eq(unit.propertyId, propertyId), isNull(tenant.id)));

      return {
        success: true,
        data: availableUnits.map((row) => row.unit),
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch available units.",
      };
    }
  }
);
