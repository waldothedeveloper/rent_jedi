import { z } from "zod";

// LOGIN RELATED SCHEMA
export const loginSchema = z.object({
  email: z.email("Please enter a valid email."),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(128, "Password must be at most 128 characters."),
});

// SIGNUP RELATED SCHEMA
export const signUpPasswordSchema = z
  .string()
  .min(12, "Minimum 12 characters")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Z]/, "Must include at least 1 uppercase")
  .regex(/[a-z]/, "Must include at least 1 lowercase")
  .regex(/\d/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a symbol");

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be at most 50 characters."),
    email: z.email("Please enter a valid email."),
    password: signUpPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

// FORGOT PASSWORD
export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email."),
});

// RESET PASSWORD
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset link is missing or invalid."),
    newPassword: signUpPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export const twoFactorSchema = z.object({
  password: signUpPasswordSchema,
});
