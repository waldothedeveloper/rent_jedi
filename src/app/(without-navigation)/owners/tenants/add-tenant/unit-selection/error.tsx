"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UnitSelectionError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Unit selection error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-destructive">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            {error.message ||
              "We encountered an error while loading the unit selection. Please try again."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/owners/tenants/add-tenant/lease-dates">
              Back to Step 2
            </Link>
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
