"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getRedirectUrl } from "@/lib/auth-utils-client";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        router.push("/");
        return;
      }

      const intent = sessionStorage.getItem("signup_intent");
      if (intent) sessionStorage.removeItem("signup_intent");

      const redirectUrl = getRedirectUrl({ role: session.user.role, intent });
      router.push(redirectUrl);
    }

    handleRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
