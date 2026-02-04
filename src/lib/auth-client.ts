import {
  globalAC,
  platformAdmin,
  globalOwner,
  globalManager,
  globalTenant,
  organizationAC,
  orgOwner,
  orgManager,
  orgTenant,
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
      ac: organizationAC,
      roles: {
        owner: orgOwner,
        manager: orgManager,
        tenant: orgTenant,
      },
    }),
    adminClient({
      ac: globalAC,
      roles: {
        admin: platformAdmin,
        // TEMPORARY: Keep global versions during migration
        owner: globalOwner,
        manager: globalManager,
        tenant: globalTenant,
      },
    }),
    twoFactorClient(),
  ],
});
