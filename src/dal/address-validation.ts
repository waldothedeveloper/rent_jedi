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
      // ("GOOGLE_MAPS_API_KEY not configured");
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
                : (process.env.VERCEL_PROJECT_PRODUCTION_URL ??
                  // Fallback for local testing when we use npm run build && npm run start
                  "http://localhost:3000"),
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
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
      const verdict = data.result.verdict;
      const postalAddress = data.result.address.postalAddress;
      const addressComponents = data.result.address.addressComponents;

      // Fallback to uspsData only if postalAddress is missing data
      const uspsAddress = data.result.uspsData?.standardizedAddress;

      // Check if there's a confirmed subpremise component (valid apartment/suite)
      const hasConfirmedSub = hasConfirmedSubpremise(addressComponents);

      // Construct the Google recommended address from postalAddress (guaranteed)
      const googleAddress: NormalizedAddress = {
        // Use postalAddress.addressLines[0] as primary source
        addressLine1:
          postalAddress.addressLines[0] ||
          uspsAddress?.firstAddressLine ||
          address.addressLine1,

        // For addressLine2:
        // - Only include if Google confirmed there's a valid subpremise component
        // - USPS just uppercases whatever is entered, so we can't trust it alone
        // - If no confirmed subpremise, omit addressLine2 entirely
        addressLine2:
          hasConfirmedSub && uspsAddress?.secondAddressLine
            ? uspsAddress.secondAddressLine
            : undefined,

        city: postalAddress.locality || uspsAddress?.city || address.city,
        state:
          postalAddress.administrativeArea ||
          uspsAddress?.state ||
          address.state,
        zipCode:
          postalAddress.postalCode || uspsAddress?.zipCode || address.zipCode,
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

      // Determine if we should prompt user based on Google's recommendation
      const shouldPromptUser = verdict.possibleNextAction !== "ACCEPT";

      // Generate user-friendly validation message
      let validationMessage: string | undefined;

      switch (verdict.possibleNextAction) {
        case "FIX":
          validationMessage =
            "This address does not seem correct. Please verify the address and correct the information.";
          break;
        case "CONFIRM_ADD_SUBPREMISES":
          validationMessage =
            "This address may be missing a unit number. Please add apartment, suite, or unit number if applicable.";
          break;
        case "CONFIRM":
          validationMessage =
            "Please confirm this address is correct. We found some minor differences.";
          break;
        case "ACCEPT":
          validationMessage = undefined; // High quality address, no message needed
          break;
        default:
          validationMessage = "Please verify this address.";
      }

      return {
        success: true,
        userAddress,
        googleAddress,
        verdict,
        shouldPromptUser,
        validationMessage,
      };
    } catch (error) {
      return {
        success: false,
        message:
          "Unable to validate address at this time. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      };
    }
  },
);

/**
 * Checks if there's a valid confirmed subpremise component
 * @param addressComponents - Array of address components from Google API
 * @returns true if there's a confirmed subpremise component
 */
function hasConfirmedSubpremise(
  addressComponents?: Array<{
    componentType: string;
    confirmationLevel: string;
  }>,
): boolean {
  if (!addressComponents) return false;

  return addressComponents.some(
    (component) =>
      component.componentType === "subpremise" &&
      component.confirmationLevel === "CONFIRMED",
  );
}
