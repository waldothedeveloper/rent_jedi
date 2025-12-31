import { getDraftPropertyByOwnerDAL } from "@/dal/properties";
import { redirect } from "next/navigation";

export default async function AddPropertyEntryPage() {
  // Check if user has a draft property
  const result = await getDraftPropertyByOwnerDAL();

  // No draft found → Start at step 1 (address)
  if (!result.success || !result.data) {
    redirect("/owners/properties/add-property/address");
  }

  const { property, unitsCount } = result.data;

  // Has address but no unitType → Step 2 (property type)
  if (!property.unitType) {
    redirect(
      `/owners/properties/add-property/property-type?propertyId=${property.id}`
    );
  }

  // Has unitType but no units → Step 3 (unit details)
  if (unitsCount === 0) {
    const step3Path =
      property.unitType === "single_unit"
        ? "/owners/properties/add-property/single-unit-option"
        : "/owners/properties/add-property/multi-unit-option";
    redirect(`${step3Path}?propertyId=${property.id}`);
  }

  // Draft has units → Property is complete, go to properties list
  redirect("/owners/properties");
}
