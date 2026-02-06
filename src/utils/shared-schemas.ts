import { PHONEREGEX } from "@/lib/utils";
import {
  currentYear,
  propertyTypeOptions,
  toE164Phone,
  unitTypeOptions,
  usStateOptions,
} from "@/utils/form-helpers";
import { z } from "zod";

const optionalString = () =>
  z
    .string()
    .trim()
    .transform((val) => val || undefined);

const requiredString = () => z.string().trim();

const phoneField = () =>
  z
    .string()
    .trim()
    .transform((val) => {
      if (!val) return undefined;
      return toE164Phone(val) || undefined;
    })
    .pipe(
      z.union([
        z.undefined(),
        z.string().regex(new RegExp(PHONEREGEX), "Invalid phone format"),
      ])
    );

const optionalNumeric = (min?: number, max?: number) => {
  return z
    .union([
      z.string().trim().regex(/^\d+$/, "Use numbers only."),
      z.literal(""),
    ])
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(
      z.union([
        z.undefined(),
        z
          .number()
          .int()
          .refine((v) => min === undefined || v >= min)
          .refine((v) => max === undefined || v <= max),
      ])
    );
};

export const propertyFormSchema = z.object({
  name: requiredString(),
  addressLine1: requiredString().min(2, "Address line 1 is required."),
  city: requiredString().min(2, "City is required."),
  zipCode: requiredString().min(3, "ZIP / Postal code is required."),

  country: z
    .string()
    .trim()
    .min(2, "Country is required.")
    .transform((val) => val || "United States"),

  description: optionalString().refine(
    (val) => !val || val.length <= 2000,
    "Keep the description under 2000 characters."
  ),
  addressLine2: optionalString(),

  unitType: z.enum(unitTypeOptions, "Please select a unit type."),
  propertyType: z.enum(propertyTypeOptions, "Please select a property type."),
  state: z.enum(usStateOptions, {
    message: "Select a US state or territory.",
  }),

  contactEmail: z
    .string()
    .trim()
    .transform((val) => val || undefined)
    .pipe(z.union([z.undefined(), z.email("Enter a valid email.")])),

  contactPhone: phoneField(),

  yearBuilt: optionalNumeric(1700, currentYear),
  buildingSqFt: optionalNumeric(1),
  lotSqFt: optionalNumeric(1),
});

export const addressFormSchema = z.object({
  addressLine1: requiredString().min(2, "Address line 1 is required."),
  addressLine2: optionalString(),
  city: requiredString().min(2, "City is required."),
  state: z.enum(usStateOptions, {
    message: "Select a US state or territory.",
  }),
  zipCode: requiredString().min(3, "ZIP / Postal code is required."),
  country: z
    .string()
    .trim()
    .min(2, "Country is required.")
    .transform((val) => val || "United States"),
});

export const propertyNameFormSchema = z.object({
  name: requiredString()
    .min(1, "Property name is required.")
    .max(200, "Keep the name under 200 characters."),
  propertyType: propertyFormSchema.shape.propertyType,
  description: optionalString().refine(
    (val) => !val || val.length <= 2000,
    "Keep the description under 2000 characters."
  ),
});

