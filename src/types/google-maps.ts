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
    verdict: Verdict;
    address: {
      formattedAddress: string;
      postalAddress: {
        regionCode: string;
        locality?: string;
        administrativeArea?: string;
        postalCode?: string;
        addressLines: string[];
      };
      addressComponents?: Array<{
        componentName: {
          text: string;
        };
        componentType: string;
        confirmationLevel: string;
      }>;
      missingComponentTypes?: string[];
      unconfirmedComponentTypes?: string[];
    };
    uspsData?: {
      standardizedAddress: {
        firstAddressLine: string;
        secondAddressLine?: string;
        cityStateZipAddressLine?: string;
        city: string;
        state: string;
        zipCode?: string;
        zipCodeExtension?: string;
      };
    };
  };
}

// Verdict types
export type ValidationGranularity =
  | "GRANULARITY_UNSPECIFIED"
  | "SUB_PREMISE"
  | "PREMISE"
  | "PREMISE_PROXIMITY"
  | "BLOCK"
  | "ROUTE"
  | "OTHER";

export type PossibleNextAction =
  | "ACCEPT"
  | "CONFIRM"
  | "CONFIRM_ADD_SUBPREMISES"
  | "FIX";

export interface Verdict {
  inputGranularity?: ValidationGranularity;
  validationGranularity?: ValidationGranularity;
  geocodeGranularity?: ValidationGranularity;
  addressComplete?: boolean;
  hasUnconfirmedComponents?: boolean;
  hasInferredComponents?: boolean;
  hasReplacedComponents?: boolean;
  possibleNextAction?: PossibleNextAction;
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
  verdict: Verdict;
  shouldPromptUser: boolean;
  validationMessage?: string;
}

// Union type for validation results
export type AddressValidationResult =
  | AddressValidationSuccess
  | AddressValidationError;
