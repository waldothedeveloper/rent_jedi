import TenantBasicInfoForm from "./form";
import { getTenantForEdit } from "@/app/actions/tenants";

interface TenantBasicInfoPageProps {
  searchParams: Promise<{ tenantId?: string }>;
}

export default async function TenantBasicInfoPage({
  searchParams,
}: TenantBasicInfoPageProps) {
  const params = await searchParams;
  const tenantId = params.tenantId;

  let tenantData = null;

  if (tenantId) {
    const result = await getTenantForEdit(tenantId);
    if (result.success && result.tenant) {
      tenantData = result.tenant;
    }
  }

  return <TenantBasicInfoForm tenantId={tenantId} initialData={tenantData} />;
}
