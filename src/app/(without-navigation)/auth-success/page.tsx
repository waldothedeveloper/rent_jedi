"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getPostLoginRedirectAction } from "@/app/actions/auth";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        router.push("/");
        return;
      }

      const redirectUrl = await getPostLoginRedirectAction();
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
