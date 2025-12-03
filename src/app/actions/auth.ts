"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/shared-auth-schema";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

type HeadersLike = Pick<Headers, "get"> | null | undefined;

function getBaseUrl(headersList?: HeadersLike) {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;
  const origin = headersList?.get("origin");
  const host = headersList?.get("host");
  const rawBase = envUrl ?? origin ?? (host ? `http://${host}` : undefined);
  const withProtocol = rawBase?.startsWith("http")
    ? rawBase
    : rawBase
      ? `https://${rawBase}`
      : "http://localhost:3000";

  return withProtocol.replace(/\/$/, "");
}

export async function getSessionOrRedirect() {
  const sessionResponse = await auth.api.getSession({
    headers: await headers(),
  });

  const session = sessionResponse;

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function resendVerificationEmailAction() {
  const headersList = await headers();

  const sessionResponse = await getSessionOrRedirect();

  const email = sessionResponse?.user?.email;

  if (!email) {
    return {
      success: false as const,
      message: "Email is required to resend verification email",
    };
  }

  const callbackURL = `${getBaseUrl(headersList)}/dashboard`;

  await auth.api.sendVerificationEmail({
    headers: headersList,
    body: {
      email,
      callbackURL,
    },
  });

  return {
    success: true as const,
    message: "Verification email re-sent successfully!",
  };
}

export async function signUpAction(credentials: z.infer<typeof signUpSchema>) {
  const result = signUpSchema.safeParse(credentials);

  if (!result.success) {
    return result.error;
  }
  const { name, email, password } = result.data;

  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  redirect(`/verify-email`);
}

export async function signUpWithGoogleAction() {
  const res = await auth.api.signInSocial({
    body: {
      provider: "google",
    },
  });

  if ("user" in res && res.user.emailVerified) {
    redirect("/dashboard");
  }
  redirect("/verify-email");
}

export async function loginAction(credentials: z.infer<typeof loginSchema>) {
  const result = loginSchema.safeParse(credentials);
  if (!result.success) {
    return result.error;
  }
  const { email, password } = result.data;

  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  payload: z.infer<typeof forgotPasswordSchema>
) {
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return parsed.error;
  }

  const headersList = await headers();
  const redirectTo = `${getBaseUrl(headersList)}/reset-password`;

  await auth.api.requestPasswordReset({
    body: {
      email: parsed.data.email,
      redirectTo,
    },
  });

  return { success: true } as const;
}

export async function resetPasswordAction(
  payload: z.infer<typeof resetPasswordSchema>
) {
  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return parsed.error;
  }

  await auth.api.resetPassword({
    body: {
      newPassword: parsed.data.newPassword,
      token: parsed.data.token,
    },
  });

  return { success: true } as const;
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}
