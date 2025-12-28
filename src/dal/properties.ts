"server only";

import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { property } from "@/db/schema/properties-schema";
import { unit } from "@/db/schema/units-schema";

/*

TYPE DEFINITIONS BELOW

*/

type Roles = "admin" | "tenant" | "owner" | "manager" | undefined;

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
      console.error("Error creating property:", error);
      return {
        success: false as const,
        message:
          "Failed to create property. Please try again or contact support.",
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
    const properties = await db
      .select()
      .from(property)
      .where(eq(property.ownerId, session.user.id));

    return {
      success: true as const,
      data: properties,
    };
  } catch (error) {
    console.error("Error listing properties:", error);
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
      console.error("Error fetching property by ID:", error);
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
      console.error("Error creating unit:", error);
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
      console.error("Error creating units:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create units. Please try again.",
      };
    }
  }
);
