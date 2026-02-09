import {
  orgOwner,
  orgTenant,
  organizationAccessController,
} from "@/lib/permissions";
import {
  adminClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac: organizationAccessController,
      roles: {
        owner: orgOwner,
        tenant: orgTenant,
      },
    }),

    twoFactorClient(),
    adminClient(),
  ],
});
