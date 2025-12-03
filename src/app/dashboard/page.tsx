import { getSessionOrRedirect, logoutAction } from "@/app/actions/auth";

import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const { user } = await getSessionOrRedirect();

  return (
    <div className="flex flex-col mx-auto min-h-screen items-center justify-center space-y-8 p-4">
      <p>Welcome {user?.name}.</p>
      <p>This is your Dashboard Page</p>
      <p>The registered email on this account is</p>
      <p> {user?.email}</p>
      <form>
        <Button type="submit" formAction={logoutAction}>
          Logout
        </Button>
      </form>
    </div>
  );
}
