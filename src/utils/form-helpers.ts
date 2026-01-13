import type { ChangeEvent, KeyboardEvent } from "react";

import { PHONEREGEX } from "@/lib/utils";
import { z } from "zod";

export const currentYear = new Date().getFullYear();
export const formattedPhoneRegex = /^\(\d{3}\) \d{3} - \d{4}$/;

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

export const formatPhoneFromE164 = (phone: string | null): string => {
  if (!phone) return "";

  if (phone.startsWith("+1") && phone.length === 12) {
    const digits = phone.slice(2);
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
  }
  return phone;
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

export const propertyStatusOptions = [
  "draft",
  "live",
  "paused",
  "rented",
] as const;

export type PropertyStatus = (typeof propertyStatusOptions)[number];

export const propertyStatusSelectOptions = [
  { value: "draft", label: "Draft" },
  { value: "live", label: "Live" },
  { value: "paused", label: "Paused" },
  { value: "rented", label: "Rented" },
] as const;

export const bedroomOptions = [
  { value: "studio", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12+", label: "+12" },
] as const;

export const bathroomOptions = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "2" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3" },
  { value: "3.5", label: "3.5" },
  { value: "4", label: "4" },
  { value: "4.5", label: "4.5" },
  { value: "5", label: "5" },
  { value: "5.5", label: "5.5" },
  { value: "6", label: "6" },
  { value: "6.5", label: "6.5" },
  { value: "7", label: "7" },
  { value: "7.5", label: "7.5" },
  { value: "8", label: "8" },
  { value: "8.5", label: "8.5" },
  { value: "9", label: "9" },
  { value: "9.5", label: "9.5" },
  { value: "10", label: "10" },
  { value: "10.5", label: "10.5" },
  { value: "11", label: "11" },
  { value: "11.5", label: "11.5" },
  { value: "12+", label: "+12" },
] as const;

export const bedroomsToString = (bedrooms: number | null): string => {
  if (bedrooms === null) return "";
  if (bedrooms === 0) return "studio";
  if (bedrooms >= 12) return "12+";
  return bedrooms.toString();
};

export const bathroomsToString = (bathrooms: string | null): string => {
  if (!bathrooms) return "";
  const num = parseFloat(bathrooms);
  if (num >= 12) return "12+";
  return bathrooms;
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

export const controlClassName =
  "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-w-0 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

// Tenant form schemas
export const tenantBasicInfoSchema = z
  .object({
    firstName: requiredString().min(1, "First name is required."),
    lastName: requiredString().min(1, "Last name is required."),
    email: z
      .string()
      .trim()
      .transform((val) => val || undefined)
      .pipe(z.union([z.undefined(), z.email("Enter a valid email.")])),
    phone: phoneField(),
  })
  .refine((data) => data.email !== undefined || data.phone !== undefined, {
    message: "Either email or phone is required.",
    path: ["email"],
  });

export const leaseDatesSchema = z
  .object({
    leaseStartDate: z
      .string()
      .min(1, "Lease start date is required.")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
    leaseEndDate: z
      .string()
      .trim()
      .transform((val) => val || undefined)
      .pipe(
        z.union([
          z.undefined(),
          z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
        ])
      ),
  })
  .refine(
    (data) => {
      if (!data.leaseEndDate) return true;
      const start = new Date(data.leaseStartDate);
      const end = new Date(data.leaseEndDate);
      return end > start;
    },
    {
      message: "Lease end date must be after start date.",
      path: ["leaseEndDate"],
    }
  );

export const unitSelectionSchema = z.object({
  propertyId: z.uuid("Please select a property."),
  unitId: z.uuid("Please select a unit."),
});

export const createTenantSchema = tenantBasicInfoSchema
  .and(leaseDatesSchema)
  .and(unitSelectionSchema);
