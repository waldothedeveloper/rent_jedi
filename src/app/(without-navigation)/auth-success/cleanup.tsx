"use client";

import { useEffect } from "react";

export function OAuthCleanup() {
  useEffect(() => {
    // Clear signup role from storage after OAuth completes
    sessionStorage.removeItem("signup_role");
  }, []);

  return null;
}
