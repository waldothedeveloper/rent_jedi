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

const ERRORS = {
  NOT_SIGNED_IN: "⛔️ Access Denied. You must be signed in.",
  NO_CREATE_PROPERTY_PERMISSION:
    "⛔️ Access Denied. You do not have permission to create a property.",
  NO_VIEW_PROPERTY_PERMISSION:
    "⛔️ Access Denied. You do not have permission to view this property.",
  NO_LIST_PROPERTIES_PERMISSION:
    "⛔️ Access Denied. You do not have permission to list properties.",
  NO_UPDATE_PROPERTY_PERMISSION:
    "⛔️ Access Denied. You do not have permission to update a property.",
  NO_DELETE_PROPERTY_PERMISSION:
    "⛔️ Access Denied. You do not have permission to delete a property.",
  NO_CREATE_UNIT_PERMISSION:
    "⛔️ Access Denied. You do not have permission to create a unit.",
  NO_UPDATE_UNIT_PERMISSION:
    "⛔️ Access Denied. You do not have permission to update units.",
  PROPERTY_NOT_FOUND: "Property not found.",
  UNIT_NOT_FOUND: "Unit not found.",
  NOT_PROPERTY_OWNER:
    "⛔️ Access Denied. You do not have permission to access this property.",
  NOT_UNIT_OWNER:
    "⛔️ Access Denied. You do not have permission to update this unit.",
  FAILED_TO_CREATE_PROPERTY: "Failed to create property. Please try again.",
  FAILED_TO_CREATE_UNIT: "Failed to create unit. Please try again.",
  FAILED_TO_CREATE_UNITS: "Failed to create units. Please try again.",
  FAILED_TO_UPDATE_PROPERTY: "Failed to update property. Please try again.",
  FAILED_TO_DELETE_PROPERTY: "Failed to delete property. Please try again.",
  FAILED_TO_FETCH_PROPERTY: "Failed to fetch property. Please try again.",
  FAILED_TO_LIST_PROPERTIES: "Failed to list properties. Please try again.",
  DUPLICATE_UNIT_NAME:
    "A unit with this name already exists for this property. Please choose a different name.",
} as const;

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

export const createPropertyDAL = async (
  data: Property
): Promise<CreateProperty> => {
    const session = await verifySessionDAL();

    if (!session) {
      return {
        success: false as const,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    if (
      !(await canCreateProperty(session.user.id, session.user.role as Roles))
    ) {
      return {
        success: false as const,
        message: ERRORS.NO_CREATE_PROPERTY_PERMISSION,
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
      console.error("[createPropertyDAL] Error:", error);
      return {
        success: false as const,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_CREATE_PROPERTY,
      };
    }
  };

export const listPropertiesDAL = cache(async () => {
  const session = await verifySessionDAL();

  if (!session) {
    return {
      success: false as const,
      message: ERRORS.NOT_SIGNED_IN,
    };
  }

  try {
    // Run permission check and query in parallel
    const [hasPermission, properties] = await Promise.all([
      canListProperties(session.user.id, session.user.role as Roles),
      db
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
        .groupBy(property.id),
    ]);

    if (!hasPermission) {
      return {
        success: false as const,
        message: ERRORS.NO_LIST_PROPERTIES_PERMISSION,
      };
    }

    return {
      success: true as const,
      data: properties,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : ERRORS.FAILED_TO_LIST_PROPERTIES,
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
    // Start session and both queries immediately
    const sessionPromise = verifySessionDAL();
    const propertyPromise = db
      .select()
      .from(property)
      .where(eq(property.id, propertyId))
      .limit(1);
    const unitsPromise = db
      .select()
      .from(unit)
      .where(eq(unit.propertyId, propertyId));

    const session = await sessionPromise;
    if (!session) {
      return {
        success: false,
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and data fetches in parallel
      const [hasPermission, propertyRows, units] = await Promise.all([
        canViewProperty(session.user.id, session.user.role as Roles),
        propertyPromise,
        unitsPromise,
      ]);

      if (!hasPermission) {
        return {
          success: false,
          message: ERRORS.NO_VIEW_PROPERTY_PERMISSION,
        };
      }

      const propertyRecord = propertyRows[0];
      if (!propertyRecord) {
        return {
          success: false,
          message: ERRORS.PROPERTY_NOT_FOUND,
        };
      }

      return {
        success: true,
        data: {
          ...propertyRecord,
          units,
        },
      };
    } catch (error) {
      console.error("[getPropertyByIdDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_FETCH_PROPERTY,
      };
    }
  }
);

export const createUnitDAL = async (
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
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    if (!(await canCreateUnit(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message: ERRORS.NO_CREATE_UNIT_PERMISSION,
      };
    }

    try {
      const [createdUnit] = await db.insert(unit).values(data).returning();

      return {
        success: true,
        data: createdUnit,
      };
    } catch (error) {
      console.error("[createUnitDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_CREATE_UNIT,
      };
    }
  };

export const createUnitsDAL = async (
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
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    if (!(await canCreateUnit(session.user.id, session.user.role as Roles))) {
      return {
        success: false,
        message: ERRORS.NO_CREATE_UNIT_PERMISSION,
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
          message: ERRORS.DUPLICATE_UNIT_NAME,
        };
      }

      return {
        success: false,
        message: errorMessage || ERRORS.FAILED_TO_CREATE_UNITS,
      };
    }
  };

export const updatePropertyDraftDAL = async (
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
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and existence check in parallel
      const [hasPermission, existingProperty] = await Promise.all([
        canUpdateProperty(session.user.id, session.user.role as Roles),
        db
          .select()
          .from(property)
          .where(eq(property.id, propertyId))
          .limit(1)
          .then((rows) => rows[0]),
      ]);

      if (!hasPermission) {
        return {
          success: false,
          message: ERRORS.NO_UPDATE_PROPERTY_PERMISSION,
        };
      }

      if (!existingProperty) {
        return {
          success: false,
          message: ERRORS.PROPERTY_NOT_FOUND,
        };
      }

      if (existingProperty.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_PROPERTY_OWNER,
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
      console.error("[updatePropertyDraftDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_UPDATE_PROPERTY,
      };
    }
  };

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
        message: ERRORS.NOT_SIGNED_IN,
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
      console.error("[getDraftPropertyByOwnerDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : ERRORS.FAILED_TO_FETCH_PROPERTY,
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
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and query in parallel
      const [hasPermission, result] = await Promise.all([
        canViewProperty(session.user.id, session.user.role as Roles),
        db
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
          .limit(1),
      ]);

      if (!hasPermission) {
        return {
          success: false,
          message: ERRORS.NO_VIEW_PROPERTY_PERMISSION,
        };
      }

      if (result.length === 0) {
        return {
          success: false,
          message: ERRORS.PROPERTY_NOT_FOUND,
        };
      }

      const { unitsCount, ...propertyData } = result[0];

      // Verify ownership
      if (propertyData.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_PROPERTY_OWNER,
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
      console.error("[getPropertyWithUnitsCountDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_FETCH_PROPERTY,
      };
    }
  }
);

export const updateUnitDAL = async (
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
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run permission check and unit existence check in parallel
      const [hasPermission, existingUnit] = await Promise.all([
        canCreateUnit(session.user.id, session.user.role as Roles),
        db
          .select({
            unitId: unit.id,
            propertyId: unit.propertyId,
            ownerId: property.ownerId,
          })
          .from(unit)
          .innerJoin(property, eq(unit.propertyId, property.id))
          .where(eq(unit.id, unitId))
          .limit(1)
          .then((rows) => rows[0]),
      ]);

      if (!hasPermission) {
        return {
          success: false,
          message: ERRORS.NO_UPDATE_UNIT_PERMISSION,
        };
      }

      if (!existingUnit) {
        return {
          success: false,
          message: ERRORS.UNIT_NOT_FOUND,
        };
      }

      if (existingUnit.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_UNIT_OWNER,
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
      console.error("[updateUnitDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_CREATE_UNIT,
      };
    }
  };

export const deletePropertyDAL = async (
  propertyId: string
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
      // Run permission check and existence check in parallel
      const [hasPermission, existingProperty] = await Promise.all([
        canDeleteProperty(session.user.id, session.user.role as Roles),
        db
          .select()
          .from(property)
          .where(eq(property.id, propertyId))
          .limit(1)
          .then((rows) => rows[0]),
      ]);

      if (!hasPermission) {
        return {
          success: false,
          message: ERRORS.NO_DELETE_PROPERTY_PERMISSION,
        };
      }

      if (!existingProperty) {
        return {
          success: false,
          message: ERRORS.PROPERTY_NOT_FOUND,
        };
      }

      if (existingProperty.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_PROPERTY_OWNER,
        };
      }

      await db.delete(property).where(eq(property.id, propertyId));

      return {
        success: true,
      };
    } catch (error) {
      console.error("[deletePropertyDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_DELETE_PROPERTY,
      };
    }
  };

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
        message: ERRORS.NOT_SIGNED_IN,
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
      console.error("[getPropertiesWithAvailableUnitsDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : ERRORS.FAILED_TO_LIST_PROPERTIES,
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
        message: ERRORS.NOT_SIGNED_IN,
      };
    }

    try {
      // Run property check and units query in parallel
      const [propertyRecord, availableUnits] = await Promise.all([
        db
          .select()
          .from(property)
          .where(eq(property.id, propertyId))
          .limit(1)
          .then((rows) => rows[0]),
        db
          .select({
            unit: unit,
          })
          .from(unit)
          .leftJoin(
            tenant,
            and(eq(unit.id, tenant.unitId), isNull(tenant.leaseEndDate))
          )
          .where(and(eq(unit.propertyId, propertyId), isNull(tenant.id))),
      ]);

      if (!propertyRecord) {
        return {
          success: false,
          message: ERRORS.PROPERTY_NOT_FOUND,
        };
      }

      if (propertyRecord.ownerId !== session.user.id) {
        return {
          success: false,
          message: ERRORS.NOT_PROPERTY_OWNER,
        };
      }

      return {
        success: true,
        data: availableUnits.map((row) => row.unit),
      };
    } catch (error) {
      console.error("[getAvailableUnitsByPropertyDAL] Error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch available units.",
      };
    }
  }
);
