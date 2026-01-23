import { getTenantForEdit } from "@/app/actions/tenants";
import { redirect } from "next/navigation";
import EditTenantForm from "./form";

interface EditTenantPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditTenantPage({
  searchParams,
}: EditTenantPageProps) {
  const params = await searchParams;
  const tenantId = params.tenantId;

  if (!tenantId || typeof tenantId !== "string") {
    redirect("/owners/tenants");
  }

  const tenantResult = await getTenantForEdit(tenantId);

  if (!tenantResult.success || !tenantResult.tenant) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error</p>
          <p className="text-muted-foreground">
            {tenantResult.message || "Tenant not found."}
          </p>
        </div>
      </div>
    );
  }

  return <EditTenantForm tenant={tenantResult.tenant} />;
}
