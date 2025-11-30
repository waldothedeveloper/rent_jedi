import { account, session, user, verification } from "@/db/schema/auth-schema";

import type { User } from "better-auth";
import { betterAuth } from "better-auth";
import { db } from "@/db/drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";

type SendResetPasswordPayload = { user: User; url: string; token: string };
type OnPasswordResetPayload = { user: User };

function getSendEmailUrl(request?: Request) {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;

  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}/api/send`;
  }

  const origin = request?.headers?.get?.("origin");
  return `${(origin ?? "http://localhost:3000").replace(/\/$/, "")}/api/send`;
}

export const auth = betterAuth({
  appName: "Rent Jedi",
  plugins: [twoFactor(), nextCookies()],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (
      { user, url, token: _token }: SendResetPasswordPayload,
      request?: Request
    ) => {
      const apiSendUrl = getSendEmailUrl(request);

      await fetch(apiSendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Reset your Rent Jedi password",
          firstName: user.name,
          resetUrl: url,
          template: "reset",
        }),
      }).catch((error) => {
        console.error("Failed to send reset password email", error);
      });
    },
    onPasswordReset: async (
      { user }: OnPasswordResetPayload,
      request?: Request
    ) => {
      const apiSendUrl = getSendEmailUrl(request);

      await fetch(apiSendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Your Rent Jedi password was reset",
          firstName: user.name,
          template: "reset-confirmation",
        }),
      }).catch((error) => {
        console.error(
          "Failed to send password reset confirmation email",
          error
        );
      });
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
});
