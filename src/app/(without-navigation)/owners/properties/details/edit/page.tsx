import { redirect } from "next/navigation";

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

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="text-center">
        <p className="text-lg font-semibold">Edit Property</p>
        <p className="text-muted-foreground">
          Property editing is being rebuilt. Please check back soon.
        </p>
      </div>
    </div>
  );
}
