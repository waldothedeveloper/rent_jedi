import { getPropertyForEdit } from "@/app/actions/properties";
import { redirect } from "next/navigation";
import EditPropertyForm from "./form";

interface EditPropertyPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditPropertyPage({
  searchParams,
}: EditPropertyPageProps) {
  const params = await searchParams;
  const id = params.id;

  if (!id || typeof id !== "string") {
    redirect("/owners/properties");
  }

  const result = await getPropertyForEdit(id);

  if (!result.success || !result.property) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error</p>
          <p className="text-muted-foreground">
            {result.message || "Property not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditPropertyForm
      property={result.property}
      units={result.units || []}
    />
  );
}
