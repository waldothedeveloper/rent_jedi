import { redirect } from "next/navigation";

export default async function AddTenantEntryPage() {
  // Always start at Step 1 (no draft state to resume)
  redirect("/owners/tenants/add-tenant/tenant-basic-info");
}
