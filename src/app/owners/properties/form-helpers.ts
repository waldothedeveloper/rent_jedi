import type { ChangeEvent, KeyboardEvent } from "react";

import { PHONEREGEX } from "@/lib/utils";
import { z } from "zod";

export const currentYear = new Date().getFullYear();
export const formattedPhoneRegex = /^\(\d{3}\) \d{3} - \d{4}$/;

export const disallowNonNumericInput = (
  evt: KeyboardEvent<HTMLInputElement>
) => {
  if (evt.ctrlKey) {
    return;
  }
  if (evt.key.length > 1) {
    return;
  }
  if (/[0-9.]/.test(evt.key)) {
    return;
  }
  evt.preventDefault();
};

export const formatToPhone = (evt: ChangeEvent<HTMLInputElement>) => {
  const digits = evt.target.value.replace(/\D/g, "").substring(0, 10);
  const areaCode = digits.substring(0, 3);
  const prefix = digits.substring(3, 6);
  const suffix = digits.substring(6, 10);

  if (digits.length > 6) {
    evt.target.value = `(${areaCode}) ${prefix} - ${suffix}`;
  } else if (digits.length > 3) {
    evt.target.value = `(${areaCode}) ${prefix}`;
  } else if (digits.length > 0) {
    evt.target.value = `(${areaCode}`;
  }
};

export const toE164Phone = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (new RegExp(PHONEREGEX).test(trimmed)) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return trimmed;
};

export const numericStringSchema = z.union([
  z.string().trim().regex(/^\d+$/, "Use numbers only."),
  z.literal(""),
]);

export const sanitizeText = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  return trimmed;
};

export const sanitizeNumber = (value?: string | null) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? trimmed : String(parsed);
};

export const formatLabel = (value: string) =>
  value
    .split("_")
    .map((segment) =>
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" ");

export const propertyTypeOptions = [
  "other",
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
] as const;

export type PropertyType = (typeof propertyTypeOptions)[number];

export const unitTypeOptions = ["single_unit", "multi_unit"] as const;
export type UnitType = (typeof unitTypeOptions)[number];

export const usStateOptions = [
  "AK",
  "AL",
  "AR",
  "AZ",
  "CA",
  "CO",
  "CT",
  "DC",
  "DE",
  "FL",
  "GA",
  "GU",
  "HI",
  "IA",
  "ID",
  "IL",
  "IN",
  "KS",
  "KY",
  "LA",
  "MA",
  "MD",
  "ME",
  "MI",
  "MN",
  "MO",
  "MS",
  "MT",
  "NC",
  "ND",
  "NE",
  "NH",
  "NJ",
  "NM",
  "NV",
  "NY",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VA",
  "VI",
  "VT",
  "WA",
  "WI",
  "WV",
  "WY",
] as const;

export type USStateOption = (typeof usStateOptions)[number];

export const propertyFormSchema = z.object({
  name: z.string().trim(),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2000 characters."),
  unitType: z.enum(unitTypeOptions, "Please select a unit type."),
  propertyType: z.enum(propertyTypeOptions, "Please select a property type."),
  contactEmail: z.union([z.email("Enter a valid email."), z.literal("")]),
  contactPhone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 ||
        formattedPhoneRegex.test(value) ||
        new RegExp(PHONEREGEX).test(value),
      "Use a US phone format like (555) 123 - 4567."
    ),
  addressLine1: z.string().trim().min(2, "Address line 1 is required."),
  addressLine2: z.string().trim(),
  city: z.string().trim().min(2, "City is required."),
  state: z.enum(usStateOptions, {
    message: "Select a US state or territory.",
  }),
  zipCode: z.string().trim().min(3, "ZIP / Postal code is required."),
  country: z.string().trim().min(2, "Country is required."),
  yearBuilt: numericStringSchema.refine((value) => {
    if (!value) return true;
    const year = Number(value);
    return year >= 1700 && year <= currentYear;
  }, `Year built must be between 1700 and ${currentYear}.`),
  buildingSqFt: numericStringSchema.refine((value) => {
    if (!value) return true;
    return Number(value) > 0;
  }, "Building square footage must be a positive number."),
  lotSqFt: numericStringSchema.refine((value) => {
    if (!value) return true;
    return Number(value) > 0;
  }, "Lot square footage must be a positive number."),
});

export const controlClassName =
  "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-w-0 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";
