"use server";

import { validateAddressWithGoogleDAL } from "@/dal/address-validation";
import type { AddressValidationResult } from "@/types/google-maps";
import { z } from "zod";
import { addressFormSchema } from "@/app/(without-navigation)/owners/properties/form-helpers";

/**
 * Server action to validate address with Google Maps API
 * Called from client components
 * @param data - Address data to validate
 * @returns Validation result with user and Google addresses
 */
export const validateAddress = async (
  data: z.infer<typeof addressFormSchema>
): Promise<AddressValidationResult> => {
  // Validate input with existing schema
  const { success, data: parsedData, error } = addressFormSchema.safeParse(data);

  if (!success) {
    return {
      success: false,
      message: error.issues[0]?.message || "Invalid address data provided.",
    };
  }

  // Call DAL function
  return await validateAddressWithGoogleDAL(parsedData);
};
