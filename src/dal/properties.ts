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
