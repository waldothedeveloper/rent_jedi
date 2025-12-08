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

export async function loginAction(credentials: unknown) {
  const parsed = loginSchema.safeParse(credentials);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid email or password format.",
    };
  }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
    });

    return { success: true as const, redirectTo: "/dashboard" };
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

    console.error("loginAction failed", error);
    return {
      success: false as const,
      message: "Something went wrong. Please try again.",
    };
  }
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
  redirect("/login");
}

export async function enableTwoFactorAction({
  password,
}: {
  password: string;
}) {
  console.log("password on enableTwoFactorAction: ", password);
  try {
    const result = await auth.api.enableTwoFactor({
      body: {
        password,
      },

      headers: await headers(),
    });
    console.log(`result`, result);

    return {
      success: true,
      message: "Two-factor authentication enabled successfully.",
      // data: {
      //   backupCodes,
      //   totpURI,
      // },
    };
  } catch (error) {
    console.log("error on enableTwoFactorAction: ", JSON.stringify(error));
    if (isLoginError(error)) {
      return {
        success: false as const,
        message: error?.body?.message,
      };
    }

    return {
      success: false as const,
      message: "Something went wrong. Please try again or contact support",
    };
  }
}
