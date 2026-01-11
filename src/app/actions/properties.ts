"use server";

import {
  addressFormSchema,
  propertyFormSchema,
  toE164Phone,
} from "@/app/(without-navigation)/owners/properties/form-helpers";
import {
  createPropertyDAL,
  createUnitsDAL,
  listPropertiesDAL,
  updatePropertyDraftDAL,
  verifySessionDAL,
} from "@/dal/properties";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const unitInputSchema = z.object({
  unitNumber: z.string().trim(),
  bedrooms: z.string().min(1),
  bathrooms: z.string().min(1),
  rentAmount: z.string().trim(),
  securityDepositAmount: z.preprocess((val) => val ?? "", z.string().trim()),
});

const createUnitsInputSchema = z.object({
  propertyId: z.uuid(),
  units: z.array(unitInputSchema).min(1),
});

export type CreatePropertyInput = z.input<typeof propertyFormSchema>;
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

  const propertyData = {
    ownerId: userSession.session.userId,
    name: data.name,
    description: data.description,
    propertyType: data.propertyType,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country,
    unitType: data.unitType,
    yearBuilt: data.yearBuilt,
    buildingSqFt: data.buildingSqFt,
    lotSqFt: data.lotSqFt,
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

const convertBedrooms = (value: string): number => {
  if (value === "studio") return 0;
  if (value === "12+") return 12;
  return Number(value);
};

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

  const unitsData = data.units.map((unit) => ({
    propertyId: data.propertyId,
    unitNumber: unit.unitNumber,
    bedrooms: convertBedrooms(unit.bedrooms),
    bathrooms: convertBathrooms(unit.bathrooms).toString(),
    rentAmount: Number(unit.rentAmount).toFixed(2),
    securityDepositAmount: unit.securityDepositAmount
      ? Number(unit.securityDepositAmount).toFixed(2)
      : undefined,
  }));

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

export const createPropertyDraft = async (
  data: z.infer<typeof createPropertyDraftSchema>
): Promise<{
  success: boolean;
  propertyId?: string;
  message?: string;
}> => {
  // Validate address data with optional name/description
  const {
    success,
    data: parsedData,
    error,
  } = createPropertyDraftSchema.safeParse(data);

  if (!success) {
    return {
      success: false,
      message: error.message || "Invalid property data provided.",
    };
  }

  const userSession = await verifySessionDAL();
  if (!userSession) {
    return {
      success: false,
      message: "You must be signed in to create a property draft.",
    };
  }

  // Transform data to property format (validation and transformation already handled by schema)
  const propertyData = {
    ownerId: userSession.session.userId,
    addressLine1: parsedData.addressLine1,
    addressLine2: parsedData.addressLine2,
    city: parsedData.city,
    state: parsedData.state,
    zipCode: parsedData.zipCode,
    country: parsedData.country,
    name: parsedData.name,
    description: parsedData.description,
    propertyType: parsedData.propertyType,
  };

  const result = await createPropertyDAL(propertyData);

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  revalidatePath("/owners/properties");

  return {
    success: true,
    propertyId: result.data.id,
  };
};

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
      ])
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

export const updatePropertyDraft = async (
  input: UpdatePropertyDraftInput
): Promise<{
  success: boolean;
  message?: string;
}> => {
  const { success, data, error } = updatePropertyDraftSchema.safeParse(input);

  if (!success) {
    return {
      success: false,
      message: error.message || "Invalid data provided.",
    };
  }

  const userSession = await verifySessionDAL();
  if (!userSession) {
    return {
      success: false,
      message: "You must be signed in to update a property draft.",
    };
  }

  const { propertyId, ...updateData } = data;
  const propertyUpdateData: Record<string, unknown> = {};

  if (updateData.unitType !== undefined)
    propertyUpdateData.unitType = updateData.unitType;
  if (updateData.propertyType !== undefined)
    propertyUpdateData.propertyType = updateData.propertyType;
  if (updateData.name !== undefined) propertyUpdateData.name = updateData.name;
  if (updateData.description !== undefined)
    propertyUpdateData.description = updateData.description;
  if (updateData.addressLine1 !== undefined)
    propertyUpdateData.addressLine1 = updateData.addressLine1;
  if (updateData.addressLine2 !== undefined)
    propertyUpdateData.addressLine2 = updateData.addressLine2;
  if (updateData.city !== undefined) propertyUpdateData.city = updateData.city;
  if (updateData.state !== undefined)
    propertyUpdateData.state = updateData.state;
  if (updateData.zipCode !== undefined)
    propertyUpdateData.zipCode = updateData.zipCode;
  if (updateData.country !== undefined)
    propertyUpdateData.country = updateData.country;
  if (updateData.contactEmail !== undefined)
    propertyUpdateData.contactEmail = updateData.contactEmail;
  if (updateData.contactPhone !== undefined)
    propertyUpdateData.contactPhone = updateData.contactPhone;
  if (updateData.yearBuilt !== undefined)
    propertyUpdateData.yearBuilt = updateData.yearBuilt;
  if (updateData.buildingSqFt !== undefined)
    propertyUpdateData.buildingSqFt = updateData.buildingSqFt;
  if (updateData.lotSqFt !== undefined)
    propertyUpdateData.lotSqFt = updateData.lotSqFt;

  const result = await updatePropertyDraftDAL(propertyId, propertyUpdateData);

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  revalidatePath("/owners/properties");
  revalidatePath(`/owners/properties/add-property`);

  return {
    success: true,
    message: "Property draft updated successfully",
  };
};

// Schema for unit data
const unitDataSchema = z.object({
  unitNumber: z
    .string()
    .transform((val) => val.trim())
    .transform((val) => val || "Main Unit"), // Auto-generate "Main Unit" if empty
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

export const completeSingleUnitProperty = async (
  input: CompleteSingleUnitInput
): Promise<{
  success: boolean;
  message?: string;
}> => {
  const { success, data, error } = completeSingleUnitSchema.safeParse(input);

  if (!success) {
    return {
      success: false,
      message: error.message || "Invalid data provided.",
    };
  }

  const userSession = await verifySessionDAL();
  if (!userSession) {
    return {
      success: false,
      message: "You must be signed in to complete property creation.",
    };
  }

  const { propertyId, unitData } = data;

  // First, update the property status to live
  const propertyResult = await updatePropertyDraftDAL(propertyId, {
    propertyStatus: "live",
  });

  if (!propertyResult.success) {
    return {
      success: false,
      message: propertyResult.message,
    };
  }

  // Then, create the unit
  const unitsData = [
    {
      propertyId,
      unitNumber: unitData.unitNumber,
      bedrooms: convertBedrooms(unitData.bedrooms),
      bathrooms: convertBathrooms(unitData.bathrooms).toString(),
      rentAmount: Number(unitData.rentAmount).toFixed(2),
      securityDepositAmount: unitData.securityDepositAmount
        ? Number(unitData.securityDepositAmount).toFixed(2)
        : undefined,
    },
  ];

  const unitResult = await createUnitsDAL(unitsData);

  if (!unitResult.success) {
    return {
      success: false,
      message: unitResult.message,
    };
  }

  revalidatePath("/owners/properties");
  revalidatePath(`/owners/properties/add-property`);

  return {
    success: true,
    message: "Property created successfully",
  };
};

// Schema for completing multi-unit property
const completeMultiUnitSchema = z.object({
  propertyId: z.uuid("Invalid property ID"),
  units: z.array(unitInputSchema).min(1, "At least one unit is required."),
});

export type CompleteMultiUnitInput = z.infer<typeof completeMultiUnitSchema>;

export const completeMultiUnitProperty = async (
  input: CompleteMultiUnitInput
): Promise<{
  success: boolean;
  message?: string;
}> => {
  const { success, data, error } = completeMultiUnitSchema.safeParse(input);

  if (!success) {
    return {
      success: false,
      message: error.message || "Invalid data provided.",
    };
  }

  const userSession = await verifySessionDAL();
  if (!userSession) {
    return {
      success: false,
      message: "You must be signed in to complete property creation.",
    };
  }

  const { propertyId, units } = data;

  // First, update the property status to live
  const propertyResult = await updatePropertyDraftDAL(propertyId, {
    propertyStatus: "live",
  });

  if (!propertyResult.success) {
    return {
      success: false,
      message: propertyResult.message,
    };
  }

  // Then, create all units
  const unitsData = units.map((unit) => ({
    propertyId,
    unitNumber: unit.unitNumber,
    bedrooms: convertBedrooms(unit.bedrooms),
    bathrooms: convertBathrooms(unit.bathrooms).toString(),
    rentAmount: Number(unit.rentAmount).toFixed(2),
    securityDepositAmount: unit.securityDepositAmount
      ? Number(unit.securityDepositAmount).toFixed(2)
      : undefined,
  }));

  const unitsResult = await createUnitsDAL(unitsData);

  if (!unitsResult.success) {
    return {
      success: false,
      message: unitsResult.message,
    };
  }

  revalidatePath("/owners/properties");
  revalidatePath(`/owners/properties/add-property`);

  return {
    success: true,
    message: `Property with ${units.length} unit${units.length > 1 ? "s" : ""} created successfully`,
  };
};

export const getPropertyProgress = async (propertyId: string) => {
  const { getPropertyWithUnitsCountDAL } = await import("@/dal/properties");

  const result = await getPropertyWithUnitsCountDAL(propertyId);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || "Failed to fetch property progress.",
    };
  }

  const { property, unitsCount } = result.data;

  // Determine completed steps
  let completedSteps = 1; // Has address (property exists)
  if (property.unitType) completedSteps = 2; // Has unit type
  if (unitsCount > 0) completedSteps = 3; // Has units

  // Determine current step
  let currentStep = 1;
  if (!property.unitType) {
    currentStep = 2; // Need to select unit type
  } else if (unitsCount === 0) {
    currentStep = 3; // Need to add units
  } else {
    currentStep = 3; // Completed all steps
  }

  return {
    success: true,
    property,
    unitsCount,
    completedSteps,
    currentStep,
  };
};

export const getPropertyForEdit = async (propertyId: string) => {
  const { getPropertyByIdDAL } = await import("@/dal/properties");

  const result = await getPropertyByIdDAL(propertyId);

  if (!result.success || !result.data) {
    return {
      success: false,
      message: result.message || "Failed to fetch property.",
    };
  }

  return {
    success: true,
    property: result.data,
    units: result.data.units,
  };
};

export const updateUnit = async (
  unitId: string,
  unitData: {
    unitNumber: string;
    bedrooms: string;
    bathrooms: string;
    rentAmount: string;
    securityDepositAmount?: string;
  }
) => {
  const { updateUnitDAL } = await import("@/dal/properties");

  // Validate input using the existing unit schema
  const result = unitInputSchema.safeParse(unitData);

  if (!result.success) {
    return {
      success: false,
      message: "Invalid unit data",
      errors: result.error,
    };
  }

  // Transform data
  const transformedData = {
    unitNumber: unitData.unitNumber,
    bedrooms: convertBedrooms(unitData.bedrooms),
    bathrooms: convertBathrooms(unitData.bathrooms).toString(),
    rentAmount: Number(unitData.rentAmount).toFixed(2),
    securityDepositAmount: unitData.securityDepositAmount
      ? Number(unitData.securityDepositAmount).toFixed(2)
      : undefined,
  };

  // Update in database
  const updateResult = await updateUnitDAL(unitId, transformedData);

  if (!updateResult.success) {
    return {
      success: false,
      message: updateResult.message,
    };
  }

  revalidatePath("/owners/properties");

  return {
    success: true,
    message: "Unit updated successfully",
  };
};

export const updateMultipleUnits = async (
  propertyId: string,
  updates: Array<{
    unitId?: string; // If exists, update; if not, create
    unitData: {
      unitNumber: string;
      bedrooms: string;
      bathrooms: string;
      rentAmount: string;
      securityDepositAmount?: string;
    };
  }>
) => {
  const userSession = await verifySessionDAL();
  if (!userSession) {
    return {
      success: false,
      message: "You must be signed in to update units.",
    };
  }

  try {
    // Separate into updates and creates
    const toUpdate = updates.filter((u) => u.unitId);
    const toCreate = updates.filter((u) => !u.unitId);

    // Update existing units
    for (const { unitId, unitData } of toUpdate) {
      const result = await updateUnit(unitId!, unitData);
      if (!result.success) {
        return {
          success: false,
          message: result.message || `Failed to update unit ${unitId}`,
        };
      }
    }

    // Create new units
    if (toCreate.length > 0) {
      const unitsData = toCreate.map(({ unitData }) => ({
        propertyId,
        unitNumber: unitData.unitNumber,
        bedrooms: convertBedrooms(unitData.bedrooms),
        bathrooms: convertBathrooms(unitData.bathrooms).toString(),
        rentAmount: Number(unitData.rentAmount).toFixed(2),
        securityDepositAmount: unitData.securityDepositAmount
          ? Number(unitData.securityDepositAmount).toFixed(2)
          : undefined,
      }));

      const createResult = await createUnitsDAL(unitsData);
      if (!createResult.success) {
        return {
          success: false,
          message: createResult.message,
        };
      }
    }

    revalidatePath("/owners/properties");

    return {
      success: true,
      message: `Updated ${toUpdate.length} unit${toUpdate.length !== 1 ? "s" : ""} and created ${toCreate.length} new unit${toCreate.length !== 1 ? "s" : ""}`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update units",
    };
  }
};

export const deleteProperty = async (
  propertyId: string
): Promise<{
  success: boolean;
  message?: string;
}> => {
  const { deletePropertyDAL } = await import("@/dal/properties");

  const result = await deletePropertyDAL(propertyId);

  if (!result.success) {
    return {
      success: false,
      message: result.message || "Failed to delete property",
    };
  }

  // Revalidate paths to update UI
  revalidatePath("/owners/properties");
  revalidatePath("/owners/dashboard");

  return {
    success: true,
    message: "Property deleted successfully",
  };
};
