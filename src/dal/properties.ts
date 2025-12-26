"server only";

import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { property } from "@/db/schema/properties-schema";

export const verifySessionDAL = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

type Roles =
  | "admin"
  | "tenant"
  | "owner"
  | "manager"
  | "unverifiedUser"
  | undefined;

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

type Property = typeof property.$inferInsert;
type CreateProperty =
  | {
      success: true;
      data: Property;
    }
  | {
      success: false;
      message: string;
    };

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
