"use server";

import {
  propertyFormSchema,
  sanitizeText,
  toE164Phone,
} from "@/app/owners/properties/form-helpers";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { headers } from "next/headers";
import { isRoleName } from "@/lib/permissions";
import { property } from "@/db/schema/properties-schema";
import { z } from "zod";

export type CreatePropertyInput = z.infer<typeof propertyFormSchema>;

export const createProperty = async (input: unknown) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false as const,
      message: "You must be signed in to create a property.",
    };
  }

  const parsed = propertyFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error,
    };
  }

  const canCreateProperty = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      role: isRoleName(session.user.role) ? session.user.role : undefined,
      permission: {
        property: ["create"],
      },
    },
  });

  if (!canCreateProperty.success) {
    console.error(
      "⛔ Permission denied:",
      canCreateProperty.error ??
        "User does not have permission to create a property."
    );
    return {
      success: false,
      message:
        canCreateProperty.error ??
        "You do not have permission to create a property.",
    };
  }

  try {
    // Transform form data to match database schema
    const propertyData = {
      ownerId: session.user.id,
      name: sanitizeText(parsed.data.name) || "",
      description: sanitizeText(parsed.data.description) || undefined,
      propertyType: parsed.data.propertyType,
      contactEmail: sanitizeText(parsed.data.contactEmail) || undefined,
      contactPhone: toE164Phone(parsed.data.contactPhone) || undefined,
      addressLine1: sanitizeText(parsed.data.addressLine1) || "",
      addressLine2: sanitizeText(parsed.data.addressLine2) || undefined,
      city: sanitizeText(parsed.data.city) || "",
      state: parsed.data.state,
      zipCode: sanitizeText(parsed.data.zipCode) || "",
      country: sanitizeText(parsed.data.country) || "",
      unitType: parsed.data.unitType,
      yearBuilt: parsed.data.yearBuilt
        ? Number(parsed.data.yearBuilt)
        : undefined,
      buildingSqFt: parsed.data.buildingSqFt
        ? Number(parsed.data.buildingSqFt)
        : undefined,
      lotSqFt: parsed.data.lotSqFt ? Number(parsed.data.lotSqFt) : undefined,
    };

    // Insert property into database
    const [createdProperty] = await db
      .insert(property)
      .values(propertyData)
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
        error instanceof Error
          ? error.message
          : "Failed to create property. Please try again.",
    };
  }
};
