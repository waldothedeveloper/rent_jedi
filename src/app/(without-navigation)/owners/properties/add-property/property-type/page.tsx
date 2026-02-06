import AddPropertyPropertyTypeForm from "./form";

interface AddPropertyPropertyTypePageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function AddPropertyPropertyTypePage({
  searchParams,
}: AddPropertyPropertyTypePageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  return <AddPropertyPropertyTypeForm propertyId={propertyId} initialData={null} />;
}
