// Google Maps Address Validation API Types

// Request types
export interface GoogleAddressValidationRequest {
  address: {
    regionCode: string;
    locality: string;
    administrativeArea: string;
    postalCode: string;
    addressLines: string[];
  };
}

// Response types
export interface GoogleAddressValidationResponse {
  result: {
    verdict: {
      inputGranularity: string;
      validationGranularity: string;
      addressComplete: boolean;
      hasInferredComponents: boolean;
    };
    address: {
      formattedAddress: string;
      postalAddress: {
        regionCode: string;
        locality: string;
        administrativeArea: string;
        postalCode: string;
        addressLines: string[];
      };
    };
  };
}

// Normalized address type (matches database schema)
export interface NormalizedAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// API error type
export interface AddressValidationError {
  success: false;
  message: string;
  code?: "NETWORK_ERROR" | "API_ERROR" | "INVALID_KEY" | "RATE_LIMIT";
}

// API success type
export interface AddressValidationSuccess {
  success: true;
  userAddress: NormalizedAddress;
  googleAddress: NormalizedAddress;
  areIdentical: boolean; // If true, skip dialog
}

// Union type for validation results
export type AddressValidationResult =
  | AddressValidationSuccess
  | AddressValidationError;
