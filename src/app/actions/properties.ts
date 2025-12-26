"use server";

import {
  createPropertyDAL,
  listPropertiesDAL,
  verifySessionDAL,
} from "@/dal/properties";
import {
  propertyFormSchema,
  sanitizeText,
  toE164Phone,
} from "@/app/(without-navigation)/owners/properties/form-helpers";

import { revalidatePath } from "next/cache";
import { z } from "zod";

export type CreatePropertyInput = z.infer<typeof propertyFormSchema>;

export const createProperty = async (input: CreatePropertyInput) => {
  const { success, data, error } = propertyFormSchema.safeParse(input);

  if (!success) {
    return {
      success: false,
      errors: error,
    };
  }

  const userSession = await verifySessionDAL();
  if (!userSession) {
    return {
      success: false,
      message: "You must be signed in to create a property.",
    };
  }

  // Transform form data to match database schema, there are some fields that need conversion, for example yearBuilt is an integer for the database, but comes as a string from the form
  const propertyData = {
    ownerId: userSession.session.userId,
    name: sanitizeText(data.name) || "",
    description: sanitizeText(data.description) || undefined,
    propertyType: data.propertyType,
    contactEmail: sanitizeText(data.contactEmail) || undefined,
    contactPhone: toE164Phone(data.contactPhone) || undefined,
    addressLine1: sanitizeText(data.addressLine1) || "",
    addressLine2: sanitizeText(data.addressLine2) || undefined,
    city: sanitizeText(data.city) || "",
    state: data.state,
    zipCode: sanitizeText(data.zipCode) || "",
    country: sanitizeText(data.country) || "",
    unitType: data.unitType,
    yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : undefined,
    buildingSqFt: data.buildingSqFt ? Number(data.buildingSqFt) : undefined,
    lotSqFt: data.lotSqFt ? Number(data.lotSqFt) : undefined,
  };

  const result = await createPropertyDAL(propertyData);

  if (!result.success) {
    return {
      success: result.success,
      message: result.message,
    };
  }

  revalidatePath("/owners/properties");

  return {
    success: result.success,
    data: result.data,
  };
};

export const listProperties = async () => {
  const properties = await listPropertiesDAL();
  return properties;
};
