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
          z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
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

export const sendInvitationSchema = z.object({
  tenantId: z.uuid("Invalid tenant ID."),
  unitId: z.uuid("Invalid unit ID."),
  propertyId: z.uuid("Invalid property ID."),
});

export const createPendingInviteSchema = z.object({
  tenantId: z.uuid("Invalid tenant ID."),
  propertyId: z.uuid("Invalid property ID."),
});

export const invitationChoiceSchema = z.object({
  invitationChoice: z.enum(["now", "later"]),
});

export const editTenantSchema = z
  .object({
    firstName: requiredString().min(1, "First name is required."),
    lastName: requiredString().min(1, "Last name is required."),
    email: z
      .string()
      .trim()
      .transform((val) => val || undefined)
      .pipe(z.union([z.undefined(), z.email("Enter a valid email.")])),
    phone: phoneField(),
    leaseStartDate: z
      .string()
      .trim()
      .transform((val) => val || undefined)
      .pipe(
        z.union([
          z.undefined(),
          z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
        ])
      ),
    leaseEndDate: z
      .string()
      .trim()
      .transform((val) => val || undefined)
      .pipe(
        z.union([
          z.undefined(),
          z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Invalid date format."),
        ])
      ),
  })
  .refine((data) => data.email !== undefined || data.phone !== undefined, {
    message: "Either email or phone is required.",
    path: ["email"],
  })
  .refine(
    (data) => {
      if (!data.leaseEndDate || !data.leaseStartDate) return true;
      const start = new Date(data.leaseStartDate);
      const end = new Date(data.leaseEndDate);
      return end > start;
    },
    {
      message: "Lease end date must be after start date.",
      path: ["leaseEndDate"],
    }
  );
