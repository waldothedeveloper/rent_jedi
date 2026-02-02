import { auth } from "@/lib/auth";
import { getRedirectUrlByRole } from "@/lib/auth-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthSuccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const role = session.user.role;
  console.log("role passed to getRedirectUrlByRole: ", role);
  const redirectUrl = getRedirectUrlByRole(role);
  redirect(redirectUrl);
}
