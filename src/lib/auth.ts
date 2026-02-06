import {
  globalAC,
  platformAdmin,
  organizationAC,
  orgOwner,
  orgManager,
} from "@/lib/permissions";
import {
  account,
  invitation,
  member,
  organization,
  session,
  twoFactor as twoFactorTable,
  user,
  verification,
} from "@/db/schema/auth-schema";
import {
  admin as adminPlugin,
  organization as organizationPlugin,
  twoFactor as twoFactorPlugin,
} from "better-auth/plugins";

import type { User } from "better-auth";
import { betterAuth } from "better-auth";
import { db } from "@/db/drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { property } from "@/db/schema/properties-schema";

type SendResetPasswordPayload = { user: User; url: string; token: string };
type OnPasswordResetPayload = { user: User };
const apiSendUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/send"
    : `https://${process.env.VERCEL_URL}/api/send`;

export const auth = betterAuth({
  appName: "Bloom Rent",
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: ["http://localhost:3000", "https://bloomrent.com"],
  plugins: [
    organizationPlugin({
      ac: organizationAC,
      roles: {
        owner: orgOwner,
        manager: orgManager,
      },
      creatorRole: "owner",
    }),
    twoFactorPlugin(),
    adminPlugin({
      ac: globalAC,
      roles: {
        admin: platformAdmin,
      },
    }),
    nextCookies(),
  ],
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
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
      }).catch((error) => {});
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }: SendResetPasswordPayload) => {
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
        // TODO: Handle error appropriately, inform the user of the error
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
        // TODO: Handle error appropriately, inform the user of the error
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
      twoFactor: twoFactorTable,
      organization,
      member,
      invitation,
      property,
    },
  }),
});
