import { getDraftPropertyByOwnerDAL } from "@/dal/properties";

/**
 * Determines the correct redirect path for add-property flow based on draft state.
 * Resumes the user at the appropriate step based on their progress.
 */
export async function getAddPropertyRedirectPath() {
  const result = await getDraftPropertyByOwnerDAL();

  // No draft found → Start at step 0 (property name and description)
  if (!result.success || !result.data) {
    return "/owners/properties/add-property/property-name-and-description";
  }

  const { property, unitsCount } = result.data;

  // Has draft but no name → Step 0 (property name and description)
  if (!property.name || property.name.trim() === "") {
    return `/owners/properties/add-property/property-name-and-description?propertyId=${property.id}`;
  }

  // Has name but no valid address → Step 1 (address)
  // Check for missing or placeholder address values
  if (
    !property.addressLine1 ||
    property.addressLine1.trim() === "" ||
    !property.city ||
    property.city.trim() === "" ||
    !property.zipCode ||
    property.zipCode.trim() === ""
  ) {
    return `/owners/properties/add-property/address?propertyId=${property.id}&completedSteps=1`;
  }

  // Has address but no unitType → Step 2 (property type)
  if (!property.unitType) {
    return `/owners/properties/add-property/property-type?propertyId=${property.id}&completedSteps=2`;
  }

  // Has unitType but no units → Step 3 (unit details)
  if (unitsCount === 0) {
    const step3Path =
      property.unitType === "single_unit"
        ? "/owners/properties/add-property/single-unit-option"
        : "/owners/properties/add-property/multi-unit-option";
    return `${step3Path}?propertyId=${property.id}&completedSteps=3&unitType=${property.unitType}`;
  }

  // Draft has units → Property is complete, go to properties list
  return "/owners/properties";
}
