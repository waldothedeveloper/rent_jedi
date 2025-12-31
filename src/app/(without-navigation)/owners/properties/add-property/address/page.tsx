import AddPropertyAddressForm from "./form";
import { getPropertyForEdit } from "@/app/actions/properties";

interface AddPropertyAddressPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function AddPropertyAddressPage({
  searchParams,
}: AddPropertyAddressPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  let propertyData = null;

  if (propertyId) {
    const result = await getPropertyForEdit(propertyId);
    if (result.success && result.property) {
      propertyData = result.property;
    }
  }

  return <AddPropertyAddressForm propertyId={propertyId} initialData={propertyData} />;
}
