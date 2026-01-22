"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";
import { useEffect } from "react";

// TODO: I THINK WE DO NOT NEED ANY OF THIS AT ALL....
export function ErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "role_error") {
      toast.error("Something went wrong, please contact support");

      // Clear the error parameter from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      const newUrl = newSearchParams.toString()
        ? `/?${newSearchParams.toString()}`
        : "/";
      router.replace(newUrl);
    }
  }, [error, searchParams, router]);

  return null;
}
