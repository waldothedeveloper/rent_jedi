"use server";

import { addressFormSchema, propertyFormSchema } from "@/utils/shared-schemas";

import { toE164Phone } from "@/utils/form-helpers";
import { z } from "zod";

const unitInputSchema = z.object({
  unitNumber: z.string().trim(),
  bedrooms: z.string().min(1),
  bathrooms: z.string().min(1),
  rentAmount: z.string().trim(),
  securityDepositAmount: z.preprocess((val) => val ?? "", z.string().trim()),
});

const convertBedrooms = (value: string): number => {
  if (value === "studio") return 0;
  if (value === "12+") return 12;
  return Number(value);
};

const convertBathrooms = (value: string): number => {
  if (value === "12+") return 12;
  return Number(value);
};

// Extended schema for creating property draft with optional name and description
const createPropertyDraftSchema = addressFormSchema.extend({
  name: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  propertyType: propertyFormSchema.shape.propertyType.optional(),
});

// Schema for updating property draft with partial data
const updatePropertyDraftSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  unitType: z.enum(["single_unit", "multi_unit"]).optional(),
  propertyType: z
    .enum([
      "apartment",
      "single_family_home",
      "condo",
      "co-op",
      "houseboat",
      "ranch",
      "mobile_home",
      "container_home",
      "split_level",
      "cottage",
      "mediterranean",
      "farmhouse",
      "cabin",
      "bungalow",
      "townhouse",
      "duplex",
      "triplex",
      "fourplex",
      "loft_conversion",
      "penthouse",
      "studio",
      "loft",
      "villa",
      "victorian",
      "colonial",
      "tudor",
      "craftsman",
      "tiny_house",
      "manufactured_home",
      "cape_cod",
      "mansion",
      "other",
    ])
    .optional(),
  name: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  description: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .refine((val) => !val || val.length <= 2000, "Description too long.")
    .optional(),
  addressLine1: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  addressLine2: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  city: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  state: z.string().optional(),
  zipCode: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  country: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .optional(),
  contactEmail: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .pipe(z.union([z.undefined(), z.email()]))
    .optional(),
  contactPhone: z
    .string()
    .trim()
    .transform((val) => {
      if (!val) return undefined;
      return toE164Phone(val) || undefined;
    })
    .pipe(
      z.union([
        z.undefined(),
        z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid phone format"),
      ]),
    )
    .optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1700)
    .max(new Date().getFullYear())
    .optional(),
  buildingSqFt: z.number().int().positive().optional(),
  lotSqFt: z.number().int().positive().optional(),
});

export type UpdatePropertyDraftInput = z.infer<
  typeof updatePropertyDraftSchema
>;

// Schema for unit data
const unitDataSchema = z.object({
  unitNumber: z
    .string()
    .transform((val) => val.trim())
    .transform((val) => val || "Main Unit"),
  bedrooms: z.string().min(1),
  bathrooms: z.string().min(1),
  rentAmount: z.string().trim(),
  securityDepositAmount: z.preprocess((val) => val ?? "", z.string().trim()),
});

// Schema for completing single-unit property
const completeSingleUnitSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  unitData: unitDataSchema,
});

export type CompleteSingleUnitInput = z.infer<typeof completeSingleUnitSchema>;

// Schema for completing multi-unit property
const completeMultiUnitSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  units: z.array(unitInputSchema).min(1, "At least one unit is required."),
});

export type CompleteMultiUnitInput = z.infer<typeof completeMultiUnitSchema>;

// ============================================================================
// STUB ACTIONS — will be rebuilt in the next PR
// ============================================================================

const NOT_IMPLEMENTED =
  "Property actions are being rebuilt. Please try again later.";

export const createPropertyDraft = async (
  _data: z.infer<typeof createPropertyDraftSchema>,
) => {
  return {
    success: false as const,
    message: NOT_IMPLEMENTED,
    propertyId: undefined as string | undefined,
  };
};

export const updatePropertyDraft = async (_input: UpdatePropertyDraftInput) => {
  return { success: false as const, message: NOT_IMPLEMENTED };
};

export const completeSingleUnitProperty = async (
  _input: CompleteSingleUnitInput,
) => {
  return { success: false as const, message: NOT_IMPLEMENTED };
};

export const completeMultiUnitProperty = async (
  _input: CompleteMultiUnitInput,
) => {
  return { success: false as const, message: NOT_IMPLEMENTED };
};

export const updateUnit = async (
  _unitId: string,
  _unitData: {
    unitNumber: string;
    bedrooms: string;
    bathrooms: string;
    rentAmount: string;
    securityDepositAmount?: string;
  },
) => {
  return { success: false as const, message: NOT_IMPLEMENTED };
};

export const updateMultipleUnits = async (
  _propertyId: string,
  _updates: Array<{
    unitId?: string;
    unitData: {
      unitNumber: string;
      bedrooms: string;
      bathrooms: string;
      rentAmount: string;
      securityDepositAmount?: string;
    };
  }>,
) => {
  return { success: false as const, message: NOT_IMPLEMENTED };
};

export const deleteProperty = async (_propertyId: string) => {
  return { success: false as const, message: NOT_IMPLEMENTED };
};
