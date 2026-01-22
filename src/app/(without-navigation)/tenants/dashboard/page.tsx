import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export default function TenantsDashboard() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>Dashboard content for Tenants</div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </div>
  );
}
