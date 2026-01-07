import PropertyNameAndDescriptionForm from "./form";
import { getPropertyForEdit } from "@/app/actions/properties";

interface PropertyNameAndDescriptionPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function PropertyNameAndDescriptionPage({
  searchParams,
}: PropertyNameAndDescriptionPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  let propertyData = null;

  if (propertyId) {
    const result = await getPropertyForEdit(propertyId);
    if (result.success && result.property) {
      propertyData = result.property;
    }
  }

  return (
    <PropertyNameAndDescriptionForm
      propertyId={propertyId}
      initialData={propertyData}
    />
  );
}
