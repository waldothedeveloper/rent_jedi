import {
  currentYear,
  propertyStatusOptions,
  propertyTypeOptions,
  toE164Phone,
  unitTypeOptions,
  usStateOptions,
} from "@/utils/form-helpers";

import { PHONEREGEX } from "@/lib/utils";
import { z } from "zod";

// Unit schema for editing
const editUnitSchema = z.object({
  id: z.uuid().optional(),
  unitNumber: z.string().trim(),
  bedrooms: z.string().min(1, "Please select number of bedrooms."),
  bathrooms: z.string().min(1, "Please select number of bathrooms."),
  rentAmount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{0,2})?$/, "Must be a valid amount (e.g., 1500.00).")
    .refine((val) => Number(val) >= 0, "Rent amount must be 0 or greater."),
  securityDepositAmount: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^\d+(\.\d{0,2})?$/.test(val),
      "Must be a valid amount (e.g., 1500.00)."
    )
    .refine(
      (val) => val === "" || Number(val) >= 0,
      "Security deposit must be 0 or greater."
    ),
});

// Combined edit property form schema
export const editPropertyFormSchema = z
  .object({
    // Property identification
    propertyId: z.uuid("Invalid property ID"),

    // Basic info
    name: z
      .string()
      .trim()
      .min(1, "Property name is required.")
      .max(200, "Keep the name under 200 characters."),
    description: z
      .string()
      .trim()
      .refine(
        (val) => !val || val.length <= 2000,
        "Keep the description under 2000 characters."
      )
      .transform((val) => val || undefined),
    propertyStatus: z.enum(propertyStatusOptions, {
      message: "Please select a property status.",
    }),

    // Contact info
    contactEmail: z
      .string()
      .trim()
      .refine(
        (val) => !val || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val),
        "Enter a valid email."
      )
      .transform((val) => val || undefined),
    contactPhone: z
      .string()
      .trim()
      .transform((val) => {
        if (!val) return undefined;
        return toE164Phone(val) || undefined;
      })
      .refine(
        (val) => !val || new RegExp(PHONEREGEX).test(val),
        "Invalid phone format"
      ),

    propertyType: z
      .string()
      .refine(
        (val) =>
          !val || (propertyTypeOptions as readonly string[]).includes(val),
        "Please select a valid property type."
      )
      .transform((val) =>
        val ? (val as (typeof propertyTypeOptions)[number]) : undefined
      ),
    unitType: z.enum(unitTypeOptions, {
      message: "Please select a unit type.",
    }),

    // Address
    addressLine1: z.string().trim().min(2, "Address line 1 is required."),
    addressLine2: z
      .string()
      .trim()
      .transform((val) => val || undefined),
    city: z.string().trim().min(2, "City is required."),
    state: z.enum(usStateOptions, {
      message: "Select a US state or territory.",
    }),
    zipCode: z.string().trim().min(3, "ZIP / Postal code is required."),
    country: z
      .string()
      .trim()
      .min(2, "Country is required.")
      .transform((val) => val || "United States"),

    // Property details
    yearBuilt: z
      .string()
      .trim()
      .refine((val) => !val || /^\d+$/.test(val), "Use numbers only.")
      .transform((val) => (val ? Number(val) : undefined))
      .refine(
        (val) => val === undefined || (val >= 1700 && val <= currentYear),
        `Year must be between 1700 and ${currentYear}.`
      ),
    buildingSqFt: z
      .string()
      .trim()
      .refine((val) => !val || /^\d+$/.test(val), "Use numbers only.")
      .transform((val) => (val ? Number(val) : undefined))
      .refine(
        (val) => val === undefined || val > 0,
        "Must be a positive number."
      ),
    lotSqFt: z
      .string()
      .trim()
      .refine((val) => !val || /^\d+$/.test(val), "Use numbers only.")
      .transform((val) => (val ? Number(val) : undefined))
      .refine(
        (val) => val === undefined || val > 0,
        "Must be a positive number."
      ),

    // Units array
    units: z.array(editUnitSchema).min(1, "At least one unit is required."),
  })
  .refine(
    (data) => data.unitType !== "single_unit" || data.units.length === 1,
    {
      message: "Remove extra units before switching to single unit.",
      path: ["unitType"],
    }
  )
  .refine(
    (data) => {
      if (data.unitType === "multi_unit") {
        return data.units.every((unit, index) => {
          return unit.unitNumber.trim().length > 0;
        });
      }
      return true;
    },
    {
      message: "Unit name is required for multi-unit properties.",
      path: ["units"],
    }
  );

export type EditPropertyFormValues = z.infer<typeof editPropertyFormSchema>;
export type EditUnitValues = z.infer<typeof editUnitSchema>;
