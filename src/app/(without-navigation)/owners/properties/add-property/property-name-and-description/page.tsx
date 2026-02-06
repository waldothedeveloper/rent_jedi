import PropertyNameAndDescriptionForm from "./form";

interface PropertyNameAndDescriptionPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function PropertyNameAndDescriptionPage({
  searchParams,
}: PropertyNameAndDescriptionPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  return (
    <PropertyNameAndDescriptionForm
      propertyId={propertyId}
      initialData={null}
    />
  );
}
