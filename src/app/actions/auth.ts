"use server";

import { loginSchema, signUpSchema } from "@/lib/shared-auth-schema";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

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

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}
