import { listTenants } from "@/app/actions/tenants";
import { EmptyStateTenants } from "./empty-state-tenants";
import { TenantsList } from "./tenants-list";
import { listInvitesByOwnerDAL } from "@/dal/invites";

export default async function TenantsPage() {
  const [tenantsResult, invitesResult] = await Promise.all([
    listTenants(),
    listInvitesByOwnerDAL(),
  ]);

  const { success, data } = tenantsResult;
  const invites = invitesResult.success ? invitesResult.data : [];

  return (
    <div className="size-full p-6 md:p-12 overflow-hidden">
      {success && data?.length ? (
        <TenantsList tenants={data} invites={invites} />
      ) : (
        <EmptyStateTenants />
      )}
    </div>
  );
}
