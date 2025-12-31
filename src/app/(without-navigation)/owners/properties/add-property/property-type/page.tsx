import AddPropertyPropertyTypeForm from "./form";
import { getPropertyForEdit } from "@/app/actions/properties";

interface AddPropertyPropertyTypePageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function AddPropertyPropertyTypePage({
  searchParams,
}: AddPropertyPropertyTypePageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  let propertyData = null;

  if (propertyId) {
    const result = await getPropertyForEdit(propertyId);
    if (result.success && result.property) {
      propertyData = result.property;
    }
  }

  return <AddPropertyPropertyTypeForm propertyId={propertyId} initialData={propertyData} />;
}
