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

  redirect("/dashboard");
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
