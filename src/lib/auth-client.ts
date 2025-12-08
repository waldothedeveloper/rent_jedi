import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [twoFactorClient()],
  // baseURL:
  //   process.env.NODE_ENV === "production"
  //     ? `https://${process.env.VERCEL_URL!}`
  //     : "http://localhost:3000",
});
