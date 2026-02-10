"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  totpSchema,
} from "@/lib/shared-auth-schema";

import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { getLoginRedirectUrl } from "@/dal/shared-dal-helpers";
import { getRedirectUrlByRole } from "@/lib/auth-utils";
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function resendVerificationEmailAction() {
  const headersList = await headers();

  const sessionResponse = await getSessionOrRedirect();

  const email = sessionResponse?.user?.email;
  const role = sessionResponse?.user?.role;

  if (!email) {
    return {
      success: false as const,
      message: "Email is required to resend verification email",
    };
  }

  // Use role-based callback URL
  const callbackURL = `${getBaseUrl(headersList)}${getRedirectUrlByRole(role)}`;

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

export async function signUpAction(
  credentials: z.infer<typeof signUpSchema>,
  intent?: string,
) {
  const result = signUpSchema.safeParse(credentials);

  if (!result.success) {
    return result.error;
  }
  const { name, email, password } = result.data;

  try {
    const data = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        intent: intent ?? undefined,
      },
      asResponse: true,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false as const,
        message: error.message || "Unable to create account. Please try again.",
      };
    }

    return {
      success: false as const,
      message: "Unable to create account. Please try again.",
    };
  }
}

export async function loginAction(credentials: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(credentials);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid email or password format.",
    };
  }

  try {
    const response = await auth.api.signInEmail({
      body: parsed.data,
    });

    if ("twoFactorRedirect" in response) {
      return { success: true, redirectTo: "/login/verify-totp" };
    }

    const redirectUrl = await getLoginRedirectUrl(response.user.id);

    return { success: true as const, redirectTo: redirectUrl };
  } catch (error: unknown) {
    if (error instanceof APIError) {
      return {
        success: false as const,
        message: error.message || "Something went wrong. Please try again.",
      };
    }

    return {
      success: false as const,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function verifyTotpAction(payload: {
  pin: string;
  trustDevice?: boolean;
}) {
  const parsed = totpSchema
    .extend({ trustDevice: z.boolean().optional() })
    .safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid code format. Please enter a 6-digit code.",
    };
  }

  try {
    await auth.api.verifyTOTP({
      body: {
        code: parsed.data.pin,
        trustDevice: parsed.data.trustDevice ?? false,
      },
      headers: await headers(),
    });

    const redirectUrl = await getLoginRedirectUrl();

    return { success: true as const, redirectTo: redirectUrl };
  } catch (error: unknown) {
    if (error instanceof APIError) {
      return {
        success: false as const,
        message: error.message || "Something went wrong. Please try again.",
      };
    }

    return {
      success: false as const,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function requestPasswordResetAction(
  payload: z.infer<typeof forgotPasswordSchema>,
) {
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.message ?? "Please enter a valid email address.",
    };
  }

  const headersList = await headers();
  const redirectTo = `${getBaseUrl(headersList)}/reset-password`;

  try {
    const response = await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,
        redirectTo,
      },
    });

    return {
      success: true as const,
      message: response?.message ?? "Check your email for reset instructions.",
    };
  } catch (error: unknown) {
    if (error instanceof APIError) {
      return {
        success: false as const,
        message: error.message || "Something went wrong. Please try again.",
      };
    }

    return {
      success: false as const,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function resetPasswordAction(
  payload: z.infer<typeof resetPasswordSchema>,
) {
  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid reset request. Please try again.",
    };
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: parsed.data.newPassword,
        token: parsed.data.token,
      },
    });

    return { success: true } as const;
  } catch (error: unknown) {
    if (error instanceof APIError) {
      return {
        success: false as const,
        message: error.message || "Something went wrong. Please try again.",
      };
    }

    return {
      success: false as const,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function getPostLoginRedirectAction(): Promise<string> {
  return getLoginRedirectUrl();
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}
