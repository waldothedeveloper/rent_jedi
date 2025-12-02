import { account, session, user, verification } from "@/db/schema/auth-schema";

import { db } from "@/db/drizzle";
import type { User } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { redirect } from "next/navigation";

type SendResetPasswordPayload = { user: User; url: string; token: string };
type OnPasswordResetPayload = { user: User };
const apiSendUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/send"
    : "https://rentjedi.com/api/send";

export const auth = betterAuth({
  appName: "Rent Jedi",
  plugins: [twoFactor(), nextCookies()],
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token: _token }, _request) => {
      await fetch(apiSendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Verify your Rent Jedi email",
          firstName: user.name,
          verificationUrl: url,
          template: "email-verification",
        }),
      }).catch((error) => {
        console.error("Failed to send verification email", error);
      });
    },
    async afterEmailVerification(user, request) {
      // redirect to dashboard after email verification
      redirect("/dashboard");
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    sendResetPassword: async ({
      user,
      url,
      token: _token,
    }: SendResetPasswordPayload) => {
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
    onPasswordReset: async ({ user }: OnPasswordResetPayload) => {
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
