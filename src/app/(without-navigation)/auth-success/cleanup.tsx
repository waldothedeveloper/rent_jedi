"use client";

import { useEffect } from "react";

export function OAuthCleanup() {
  useEffect(() => {
    // Clear signup intent from storage after OAuth completes
    sessionStorage.removeItem("signup_intent");
  }, []);

  return null;
}
