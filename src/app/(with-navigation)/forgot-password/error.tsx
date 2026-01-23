"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ForgotPasswordErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ForgotPasswordError({
  error,
  reset,
}: ForgotPasswordErrorProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">
              Something went wrong
            </CardTitle>
            <CardDescription>
              We couldn&apos;t load the password reset form. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button type="button" onClick={reset} className="w-full">
                Try again
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to sign in</Link>
              </Button>
              {error?.digest ? (
                <p className="text-center text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
