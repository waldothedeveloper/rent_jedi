import LeaseDatesForm from "./form";
import { getTenantForEdit } from "@/app/actions/tenants";

interface LeaseDatesPageProps {
  searchParams: Promise<{ tenantId?: string }>;
}

export default async function LeaseDatesPage({
  searchParams,
}: LeaseDatesPageProps) {
  const params = await searchParams;
  const tenantId = params.tenantId;

  let tenantData = null;

  if (tenantId) {
    const result = await getTenantForEdit(tenantId);
    if (result.success && result.tenant) {
      tenantData = result.tenant;
    }
  }

  return <LeaseDatesForm tenantId={tenantId} initialData={tenantData} />;
}
