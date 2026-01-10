import { MultiUnitDetails } from "./multi-unit-details";
import { SingleUnitDetails } from "./single-unit-details";
import { getPropertyByIdDAL } from "@/dal/properties";

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

  // Conditional rendering based on unit type
  return data.unitType === "multi_unit" ? (
    <MultiUnitDetails property={data} />
  ) : (
    <SingleUnitDetails property={data} />
  );
}
