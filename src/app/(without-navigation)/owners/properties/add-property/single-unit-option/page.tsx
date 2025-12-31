import SingleUnitOptionForm from "./form";
import { getPropertyForEdit } from "@/app/actions/properties";

interface SingleUnitOptionPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function SingleUnitOptionPage({
  searchParams,
}: SingleUnitOptionPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  let unitData = null;

  if (propertyId) {
    const result = await getPropertyForEdit(propertyId);
    if (result.success) {
      // For single-unit properties, get the first unit if it exists
      if (result.units && result.units.length > 0) {
        unitData = result.units[0];
      }
    }
  }

  return (
    <SingleUnitOptionForm
      propertyId={propertyId}
      initialUnit={unitData}
    />
  );
}
