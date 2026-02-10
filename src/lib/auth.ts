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
  orgOwner,
  orgTenant,
  organizationAccessController,
} from "@/lib/permissions";
import {
  admin as adminPlugin,
  organization as organizationPlugin,
  twoFactor as twoFactorPlugin,
} from "better-auth/plugins";

import type { User } from "better-auth";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "@/db/drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
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
      disableImplicitSignUp: true,
    },
  },
  trustedOrigins: ["http://localhost:3000", "https://bloomrent.com"],
  user: {
    additionalFields: {
      intent: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    organizationPlugin({
      ac: organizationAccessController,
      roles: {
        owner: orgOwner,
        tenant: orgTenant,
      },
      creatorRole: "owner",
    }),
    twoFactorPlugin(),
    adminPlugin(),
    nextCookies(),
  ],
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const betterAuthUrl = new URL(url);
      betterAuthUrl.searchParams.set("callbackURL", "/email-verified");

      await fetch(apiSendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Verify your Bloom Rent email",
          firstName: user.name,
          verificationUrl: betterAuthUrl.toString(),
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

  onAPIError: {
    errorURL: "/login",
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/error") {
        const queryString = new URLSearchParams(
          ctx.query as Record<string, string>,
        ).toString();
        throw ctx.redirect(`/login?${queryString}`);
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (!newSession) return;

      const userId = newSession.user.id;

      // 1. Determine intent: check user DB record first (email+password flow)
      const [userData] = await db
        .select({ intent: user.intent })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      let userIntent = userData?.intent ?? null;

      // 2. Fallback: check cookie (OAuth flow)
      if (!userIntent) {
        const cookieIntent = ctx.getCookie("signup_intent");
        if (cookieIntent === "owner" || cookieIntent === "tenant") {
          userIntent = cookieIntent;
          await db
            .update(user)
            .set({ intent: cookieIntent })
            .where(eq(user.id, userId));
          ctx.setCookie("signup_intent", "", { maxAge: 0, path: "/" });
        }
      }

      if (userIntent !== "owner") return;

      // 3. Idempotency: skip if user already has an org
      const [existing] = await db
        .select({ id: member.id, organizationId: member.organizationId })
        .from(member)
        .where(eq(member.userId, userId))
        .limit(1);

      if (existing) {
        // Ensure activeOrganizationId is set for returning owners
        if (!newSession.session.activeOrganizationId) {
          await db
            .update(session)
            .set({ activeOrganizationId: existing.organizationId })
            .where(eq(session.id, newSession.session.id));
        }
        return;
      }

      // 4. Create org + member via direct DB inserts
      const orgId = crypto.randomUUID();
      const memberId = crypto.randomUUID();
      const now = new Date();

      await db.insert(organization).values({
        id: orgId,
        name: `org-${orgId}`,
        slug: `org-${orgId}`,
        createdAt: now,
      });

      await db.insert(member).values({
        id: memberId,
        organizationId: orgId,
        userId,
        role: "owner",
        createdAt: now,
      });

      // 5. Set activeOrganizationId on the session
      await db
        .update(session)
        .set({ activeOrganizationId: orgId })
        .where(eq(session.id, newSession.session.id));
    }),
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
