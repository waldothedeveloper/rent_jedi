import AddPropertyAddressForm from "./form";

interface AddPropertyAddressPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function AddPropertyAddressPage({
  searchParams,
}: AddPropertyAddressPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  return <AddPropertyAddressForm propertyId={propertyId} initialData={null} />;
}
