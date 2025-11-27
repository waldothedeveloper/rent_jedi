import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export default function DashboardPage() {
  return (
    <div className="flex flex-col mx-auto min-h-screen items-center justify-center space-y-8 p-4">
      <p>Welcome Landlord. This is your Dashboard Page</p>
      <form>
        <Button type="submit" formAction={logoutAction}>
          Logout
        </Button>
      </form>
    </div>
  );
}
