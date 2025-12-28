import PropertyDetails from "./property-details";
import { getPropertyByIdDAL } from "@/dal/properties";
import { AddUnitForm } from "./add-unit-form";

export default async function PropertyDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await searchParams;
  const { success, data, message } = await getPropertyByIdDAL(id as string);

  if (!success || !data) {
    return (
      <div className="text-center text-destructive">
        Error: {message || "Property not found."}
      </div>
    );
  }

  if (!data.units.length) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <AddUnitForm propertyId={id as string} />
      </div>
    );
  }

  return <PropertyDetails property={data} />;
}
