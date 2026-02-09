"server only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function verifyAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return session;
}

type DeleteOrganizationDTO = {
  organizationId: string;
  deletedUnits: number;
  deletedProperties: number;
};
