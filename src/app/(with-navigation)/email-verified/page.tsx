import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SharedAuthHeader } from "@/components/shared-auth-header";
import { auth } from "@/lib/auth";
import { getLoginRedirectUrl } from "@/dal/shared-dal-helpers";
import { headers } from "next/headers";

type VerificationPanelProps = {
  isVerified: boolean;
  dashboardUrl?: string;
};

function VerificationPanel({
  isVerified,
  dashboardUrl,
}: VerificationPanelProps) {
  const Icon = isVerified ? CheckCircle2 : XCircle;

  return (
    <div className="relative py-2">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${isVerified ? "bg-primary/10" : "bg-destructive/10"}`}
      />

      <div className="relative space-y-6">
        <div className="space-y-4 text-center">
          <Icon
            className={`mx-auto size-8 ${isVerified ? "text-green-600" : "text-red-600"}`}
          />
          <div className="space-y-1.5">
            <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Account Status
            </p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {isVerified ? "Email Verified" : "Verification Failed"}
            </h1>
            <p className="mx-auto max-w-sm text-pretty text-sm text-muted-foreground">
              {isVerified
                ? "Your email is confirmed and your account is ready. Continue to your dashboard to manage listings and tenants."
                : "This verification link is invalid or already used. Sign in to request a fresh email, or contact support if this keeps happening."}
            </p>
          </div>
        </div>

        {isVerified ? (
          <Button asChild className="mx-auto flex w-full max-w-xs">
            <Link href={dashboardUrl ?? "/"}>Take me to my account</Link>
          </Button>
        ) : (
          <div className="mx-auto flex w-full max-w-xs flex-col gap-2.5">
            <Button asChild className="w-full">
              <Link href="/login">Sign In to Resend Link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact-support">Contact Support</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function EmailVerifiedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isVerified = session?.user?.emailVerified;

  if (isVerified) {
    const dashboardUrl = await getLoginRedirectUrl();

    return (
      <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-muted/60 p-6 md:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-muted)_0%,transparent_56%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--color-background))]"
        />
        <div className="relative z-10 flex w-full max-w-lg flex-col gap-8 animate-in fade-in-0 zoom-in-95 duration-500">
          <VerificationPanel isVerified dashboardUrl={dashboardUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-muted/60 p-6 md:p-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-muted)_0%,transparent_56%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--color-background))]"
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col gap-8 animate-in fade-in-0 zoom-in-95 duration-500">
        <SharedAuthHeader />
        <VerificationPanel isVerified={false} />
      </div>
    </div>
  );
}
