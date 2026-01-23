"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  totpSchema,
} from "@/lib/shared-auth-schema";

import { auth } from "@/lib/auth";
import { getRedirectUrlByRole } from "@/lib/auth-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

type HeadersLike = Pick<Headers, "get"> | null | undefined;

type LoginError = {
  status: string;
  body: { code: string; message: string };
  headers: {};
  statusCode: number;
  name: string;
};

function isLoginError(e: unknown): e is LoginError {
  return (
    typeof e === "object" &&
    e !== null &&
    "body" in e &&
    // I will accept as any here since body is not standard
    typeof (e as any).body?.code === "string"
  );
}

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

export async function signUpAction(credentials: z.infer<typeof signUpSchema>) {
  const result = signUpSchema.safeParse(credentials);

  if (!result.success) {
    return result.error;
  }
  const { name, email, password, role } = result.data;

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
    const role = res.user.role;
    redirect(getRedirectUrlByRole(role));
  }
  redirect("/verify-email");
}

export async function loginAction(credentials: unknown) {
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

    // Prefer role from sign-in response to avoid relying on a newly set cookie
    const roleFromResponse =
      "user" in response && response.user ? response.user.role : undefined;
    const role =
      roleFromResponse ??
      (await auth.api.getSession({ headers: await headers() }))?.user?.role;

    const redirectUrl = getRedirectUrlByRole(role);

    return { success: true as const, redirectTo: redirectUrl };
  } catch (error: unknown) {
    if (isLoginError(error)) {
      if (error.body.code === "EMAIL_NOT_VERIFIED") {
        return {
          success: false as const,
          message: "Please verify your email before accessing your account.",
        };
      }

      return {
        success: false as const,
        message:
          error?.body?.message || "Invalid credentials. Please try again.",
      };
    }

    // ("loginAction failed", error);
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

    // Fetch session to get user role
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const role = session?.user?.role;
    const redirectUrl = getRedirectUrlByRole(role);

    return { success: true as const, redirectTo: redirectUrl };
  } catch (error: unknown) {
    if (isLoginError(error)) {
      return {
        success: false as const,
        message: error?.body?.message ?? "Invalid or expired code.",
      };
    }

    return {
      success: false as const,
      message: "Unable to verify code. Please try again.",
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
    if (isLoginError(error)) {
      return {
        success: false as const,
        message:
          error?.body?.message ??
          "Unable to send reset link. Please try again.",
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
    // ("resetPasswordAction failed", JSON.stringify(error));
    if (isLoginError(error)) {
      return {
        success: false as const,
        message:
          error?.body?.message ??
          "Your reset link is invalid or expired. Request a new one to continue.",
      };
    }

    return {
      success: false as const,
      message:
        "Something wrong happened when trying to reset your password. Contact support or try again.",
    };
  }
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
}
