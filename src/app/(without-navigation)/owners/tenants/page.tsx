import { listTenants } from "@/app/actions/tenants";
import { EmptyStateTenants } from "./empty-state-tenants";
import { TenantsList } from "./tenants-list";

export default async function TenantsPage() {
  const { success, data } = await listTenants();

  return (
    <div className="size-full p-6 md:p-12 overflow-hidden">
      {success && data?.length ? (
        <TenantsList tenants={data} />
      ) : (
        <EmptyStateTenants />
      )}
    </div>
  );
}
