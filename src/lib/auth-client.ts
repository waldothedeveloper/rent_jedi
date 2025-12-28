import {
  accessControl,
  admin,
  manager,
  owner,
  tenant,
} from "@/lib/permissions";
import { adminClient, twoFactorClient } from "better-auth/client/plugins";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac: accessControl,
      roles: {
        admin,
        owner,
        tenant,
        manager,
      },
    }),
    twoFactorClient(),
  ],
});
