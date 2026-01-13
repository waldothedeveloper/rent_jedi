import { EmptyStateProperty } from "./empty-state-properties";
import { ListProperties } from "./list-properties";
import { listProperties } from "@/app/actions/properties";

export default async function PropertiesPage() {
  const { success, data } = await listProperties();

  return (
    <div className="flex justify-center size-full mx-auto max-w-6xl py-12 overflow-hidden">
      {success && data?.length ? (
        <ListProperties properties={data} />
      ) : (
        <EmptyStateProperty />
      )}
    </div>
  );
}
