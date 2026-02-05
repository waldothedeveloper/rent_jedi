"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getRedirectUrlByRole, getRedirectUrlByIntent } from "@/lib/auth-utils-client";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        router.push("/");
        return;
      }

      // Check for signup intent from sessionStorage
      const intent = sessionStorage.getItem("signup_intent");

      if (intent) {
        // Clear intent after reading
        sessionStorage.removeItem("signup_intent");

        // Redirect based on intent
        const redirectUrl = getRedirectUrlByIntent(intent);
        router.push(redirectUrl);
      } else {
        // No intent (existing user login via OAuth), use role-based redirect
        const redirectUrl = getRedirectUrlByRole(session.user.role);
        router.push(redirectUrl);
      }
    }

    handleRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
