import { accessControl, admin, landlord, tenant } from "@/lib/permissions";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      accessControl,
      roles: {
        admin,
        landlord,
        tenant,
      },
    }),
    twoFactorClient(),
  ],
});
