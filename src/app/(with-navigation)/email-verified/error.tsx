"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedAuthHeader } from "@/components/shared-auth-header";
import Link from "next/link";

interface EmailVerifiedErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EmailVerifiedError({
  error,
  reset,
}: EmailVerifiedErrorProps) {
  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-muted/60 p-6 md:p-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--color-muted)_0%,_transparent_56%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_var(--color-background))]"
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col gap-8 animate-in fade-in-0 zoom-in-95 duration-500">
        <SharedAuthHeader />
        <div className="relative py-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/10 blur-3xl"
          />

          <div className="relative space-y-6">
            <div className="space-y-4 text-center">
              <AlertTriangle className="mx-auto size-8 text-red-600" />
              <div className="space-y-1.5">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  Verification Status
                </p>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Something Went Wrong
                </h1>
                <p className="mx-auto max-w-sm text-pretty text-sm text-muted-foreground">
                  We couldn&apos;t load your verification state right now. Try
                  again, or return to sign in and request a fresh link.
                </p>
              </div>
            </div>

            <div className="mx-auto flex w-full max-w-xs flex-col gap-2.5">
              <Button type="button" onClick={reset} className="w-full">
                Try Again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </div>

            {error?.digest ? (
              <p className="text-center text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
