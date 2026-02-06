"server only";

import { auth } from "@/lib/auth";
import { cache } from "react";
import { headers } from "next/headers";

export const verifySessionDAL = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});

// Stubs — DAL functions will be rebuilt in the next PR

export const getDraftPropertyByOwnerDAL = cache(async () => {
  return { success: true as const, data: undefined };
});

export const getPropertyByIdDAL = cache(async (_propertyId: string) => {
  return {
    success: false as const,
    data: undefined,
    message: "Property DAL is being rebuilt.",
  };
});
