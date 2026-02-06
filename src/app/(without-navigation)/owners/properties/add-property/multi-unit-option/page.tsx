import MultiUnitOptionForm from "./form";

interface AddMultiUnitOptionPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function AddMultiUnitOptionPage({
  searchParams,
}: AddMultiUnitOptionPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  return (
    <MultiUnitOptionForm
      propertyId={propertyId}
      initialUnits={null}
    />
  );
}
