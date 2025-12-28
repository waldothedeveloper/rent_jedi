"use server";

import {
  createPropertyDAL,
  createUnitsDAL,
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

// Schema for creating units
const unitInputSchema = z.object({
  unitNumber: z.string().trim().min(1),
  bedrooms: z.string().min(1),
  bathrooms: z.string().min(1),
  rentAmount: z.string().trim(),
  securityDepositAmount: z.preprocess((val) => val ?? "", z.string().trim()),
});

const createUnitsInputSchema = z.object({
  propertyId: z.uuid(),
  units: z.array(unitInputSchema).min(1),
});

export type CreatePropertyInput = z.infer<typeof propertyFormSchema>;
export type CreateUnitsInput = z.infer<typeof createUnitsInputSchema>;

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

// Helper function to convert bedroom values
const convertBedrooms = (value: string): number => {
  if (value === "studio") return 0;
  if (value === "12+") return 12;
  return Number(value);
};

// Helper function to convert bathroom values
const convertBathrooms = (value: string): number => {
  if (value === "12+") return 12;
  return Number(value);
};

export const createUnits = async (input: CreateUnitsInput) => {
  const { success, data, error } = createUnitsInputSchema.safeParse(input);

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
      message: "You must be signed in to create units.",
    };
  }

  // Transform form data to match database schema
  const unitsData = data.units.map((unit) => ({
    propertyId: data.propertyId,
    unitNumber: sanitizeText(unit.unitNumber) || "",
    bedrooms: convertBedrooms(unit.bedrooms),
    bathrooms: convertBathrooms(unit.bathrooms).toString(),
    rentAmount: Number(unit.rentAmount).toFixed(2),
    securityDepositAmount: unit.securityDepositAmount
      ? Number(unit.securityDepositAmount).toFixed(2)
      : undefined,
  }));

  // Call DAL function to insert units
  const result = await createUnitsDAL(unitsData);

  if (!result.success) {
    return {
      success: result.success,
      message: result.message,
    };
  }

  revalidatePath("/owners/properties");
  revalidatePath(`/owners/properties/details?id=${data.propertyId}`);

  return {
    success: result.success,
    data: result.data,
  };
};
