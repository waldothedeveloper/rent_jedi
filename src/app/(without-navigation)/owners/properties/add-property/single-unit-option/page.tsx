import SingleUnitOptionForm from "./form";

interface SingleUnitOptionPageProps {
  searchParams: Promise<{ propertyId?: string }>;
}

export default async function SingleUnitOptionPage({
  searchParams,
}: SingleUnitOptionPageProps) {
  const params = await searchParams;
  const propertyId = params.propertyId;

  return (
    <SingleUnitOptionForm
      propertyId={propertyId}
      initialUnit={null}
    />
  );
}
