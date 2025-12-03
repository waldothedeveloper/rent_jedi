import { account, session, user, verification } from "@/db/schema/auth-schema";

import type { User } from "better-auth";
import { betterAuth } from "better-auth";
import { db } from "@/db/drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { redirect } from "next/navigation";
import { twoFactor } from "better-auth/plugins";

type SendResetPasswordPayload = { user: User; url: string; token: string };
type OnPasswordResetPayload = { user: User };
const apiSendUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/send"
    : "https://rentjedi.com/api/send";

export const auth = betterAuth({
  appName: "Bloom Rent",
  trustedOrigins: ["http://localhost:3000", "https://rentjedi.com"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
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
          subject: "Verify your Bloom Rent email",
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
          subject: "Reset your Bloom Rent password",
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
          subject: "Your Bloom Rent password was reset",
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
