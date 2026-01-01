import { getDraftPropertyByOwnerDAL } from "@/dal/properties";

/**
 * Determines the correct redirect path for add-property flow based on draft state.
 * Resumes the user at the appropriate step based on their progress.
 */
export async function getAddPropertyRedirectPath() {
  const result = await getDraftPropertyByOwnerDAL();

  // No draft found → Start at step 1 (address)
  if (!result.success || !result.data) {
    return "/owners/properties/add-property/address";
  }

  const { property, unitsCount } = result.data;

  // Has address but no unitType → Step 2 (property type)
  if (!property.unitType) {
    return `/owners/properties/add-property/property-type?propertyId=${property.id}&completedSteps=1`;
  }

  // Has unitType but no units → Step 3 (unit details)
  if (unitsCount === 0) {
    const step3Path =
      property.unitType === "single_unit"
        ? "/owners/properties/add-property/single-unit-option"
        : "/owners/properties/add-property/multi-unit-option";
    return `${step3Path}?propertyId=${property.id}&completedSteps=2&unitType=${property.unitType}`;
  }

  // Draft has units → Property is complete, go to properties list
  return "/owners/properties";
}
