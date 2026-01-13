import UnitSelectionForm from "./form";
import { getPropertiesWithAvailableUnitsDAL } from "@/dal/properties";

export default async function UnitSelectionPage() {
  const result = await getPropertiesWithAvailableUnitsDAL();

  const properties =
    result.success && result.data
      ? result.data.map((item) => ({
          id: item.property.id,
          name: item.property.name || "Unnamed Property",
          addressLine1: item.property.addressLine1,
          city: item.property.city,
          state: item.property.state,
          availableUnits: item.availableUnits,
          totalUnits: item.totalUnits,
        }))
      : [];

  return <UnitSelectionForm properties={properties} />;
}
