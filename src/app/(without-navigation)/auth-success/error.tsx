"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function AuthSuccessError({ error }: ErrorProps) {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-destructive">Error</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-destructive">
          Authentication Failed
        </h1>
        <p className="mt-6 text-sm font-medium text-pretty text-muted-foreground">
          {error.message ||
            "We encountered an error during the authentication process. Please try again."}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back to Login
          </Link>
          <Link href="/signup" className="text-sm font-semibold text-foreground">
            Sign Up <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
