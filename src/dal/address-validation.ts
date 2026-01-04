"server only";

import type {
  AddressValidationResult,
  GoogleAddressValidationRequest,
  GoogleAddressValidationResponse,
  NormalizedAddress,
} from "@/types/google-maps";

import { cache } from "react";
import { verifySessionDAL } from "@/dal/properties";

/**
 * Validates an address using Google Maps Address Validation API
 * @requires Authentication (owner or admin role)
 * @param address - The address to validate
 * @returns Validation result with both user and Google addresses
 */
export const validateAddressWithGoogleDAL = cache(
  async (address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): Promise<AddressValidationResult> => {
    // 1. Verify authentication
    const session = await verifySessionDAL();
    if (!session) {
      return {
        success: false,
        message:
          "⛔️ Access Denied. You must be signed in to validate addresses.",
      };
    }

    if (session.user.role !== "owner" && session.user.role !== "admin") {
      return {
        success: false,
        message:
          "⛔️ Access Denied. Only property owners can validate addresses.",
      };
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY not configured");
      return {
        success: false,
        message:
          "Address validation is temporarily unavailable. Please try again later.",
        code: "INVALID_KEY",
      };
    }

    const requestBody: GoogleAddressValidationRequest = {
      address: {
        regionCode: "US",
        locality: address.city,
        administrativeArea: address.state,
        postalCode: address.zipCode,
        addressLines: address.addressLine2
          ? [address.addressLine1, address.addressLine2]
          : [address.addressLine1],
      },
    };

    try {
      // 5. Call Google API
      const response = await fetch(
        `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            referer:
              process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : process.env.NEXT_PUBLIC_BASE_URL!,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log(
        `Google Address Validation response status: ${JSON.stringify(response, null, 2)}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Invalid Google Maps API key");
          return {
            success: false,
            message: "Address validation is temporarily unavailable.",
            code: "INVALID_KEY",
          };
        }
        if (response.status === 429) {
          return {
            success: false,
            message: "Too many requests. Please try again in a moment.",
            code: "RATE_LIMIT",
          };
        }
        throw new Error(`Google API returned status ${response.status}`);
      }

      const data: GoogleAddressValidationResponse = await response.json();
      const googlePostalAddress = data.result.address.postalAddress;
      const googleAddressLines = googlePostalAddress.addressLines || [];

      const googleAddress: NormalizedAddress = {
        addressLine1: googleAddressLines[0] || address.addressLine1,
        addressLine2: googleAddressLines[1] || undefined,
        city: googlePostalAddress.locality || address.city,
        state: googlePostalAddress.administrativeArea || address.state,
        zipCode: googlePostalAddress.postalCode || address.zipCode,
        country: "United States",
      };

      const userAddress: NormalizedAddress = {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || undefined,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      };

      const areIdentical =
        normalizeForComparison(userAddress.addressLine1) ===
          normalizeForComparison(googleAddress.addressLine1) &&
        normalizeForComparison(userAddress.addressLine2) ===
          normalizeForComparison(googleAddress.addressLine2) &&
        normalizeForComparison(userAddress.city) ===
          normalizeForComparison(googleAddress.city) &&
        userAddress.state === googleAddress.state &&
        normalizeForComparison(userAddress.zipCode) ===
          normalizeForComparison(googleAddress.zipCode);

      return {
        success: true,
        userAddress,
        googleAddress,
        areIdentical,
      };
    } catch (error) {
      console.error(
        "Error validating address with Google:",
        JSON.stringify(error, null, 2)
      );
      return {
        success: false,
        message:
          "Unable to validate address at this time. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      };
    }
  }
);

/**
 * Normalizes address string for comparison (case-insensitive, trim, etc.)
 */
function normalizeForComparison(value?: string): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}
