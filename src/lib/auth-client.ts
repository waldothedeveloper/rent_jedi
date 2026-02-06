import {
  globalAC,
  platformAdmin,
  organizationAC,
  orgOwner,
  orgManager,
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
      },
    }),
    adminClient({
      ac: globalAC,
      roles: {
        admin: platformAdmin,
      },
    }),
    twoFactorClient(),
  ],
});
