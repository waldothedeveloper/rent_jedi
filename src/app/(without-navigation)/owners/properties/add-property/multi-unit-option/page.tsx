import MultiUnitOptionForm from "./form";
import { getPropertyForEdit } from "@/app/actions/properties";

interface AddMultiUnitOptionPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function AddMultiUnitOptionPage({
  searchParams,
}: AddMultiUnitOptionPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  let unitsData = null;

  if (propertyId) {
    const result = await getPropertyForEdit(propertyId);
    if (result.success) {
      unitsData = result.units || null;
    }
  }

  return (
    <MultiUnitOptionForm
      propertyId={propertyId}
      initialUnits={unitsData}
    />
  );
}
