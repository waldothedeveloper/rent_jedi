"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { resetPasswordAction } from "@/app/actions/auth";
import { resetPasswordSchema } from "@/lib/shared-auth-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ResetPasswordFormProps = React.ComponentProps<"div"> & {
  token?: string;
  error?: string;
  usernameHint?: string;
};

export function ResetPasswordForm({
  token,
  error,
  usernameHint,
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();
  const tokenValue = token ?? "";
  const hasTokenIssue = !tokenValue || !!error;

  const form = useForm({
    defaultValues: {
      token: tokenValue,
      newPassword: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: resetPasswordSchema,
      onDynamic: resetPasswordSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await resetPasswordAction(value);
        toast.success("Password updated. You can now sign in.");
        formApi.reset();
        router.push("/login");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <CardDescription>
            {hasTokenIssue
              ? error ||
                "Your reset link is missing, invalid, or expired. Request a new one to continue."
              : "Choose a strong password to secure your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasTokenIssue ? (
            <FieldDescription className="mb-4 text-center">
              {error ? `${error} ` : null}
              <Link href="/forgot-password">Request a new reset link</Link> to
              continue.
            </FieldDescription>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <input
              type="text"
              name="username"
              autoComplete="username"
              hidden
              value={usernameHint ?? ""}
              readOnly
            />
            <FieldGroup>
              <form.Field
                name="newPassword"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      autoComplete="new-password"
                      id={field.name}
                      type="password"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      disabled={hasTokenIssue}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
              <form.Field
                name="confirmPassword"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Confirm new password
                    </FieldLabel>
                    <Input
                      autoComplete="new-password"
                      id={field.name}
                      type="password"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      disabled={hasTokenIssue}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <Field>
                <form.Subscribe
                  selector={(state) => [
                    state.canSubmit,
                    state.isSubmitting,
                    state.isPristine,
                  ]}
                  children={([canSubmit, isSubmitting, isPristine]) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        hasTokenIssue ||
                        !canSubmit ||
                        isSubmitting ||
                        isPristine
                      }
                    >
                      {isSubmitting
                        ? "Updating password..."
                        : "Update password"}
                    </Button>
                  )}
                />

                <FieldDescription className="text-center">
                  Remembered it? <Link href="/login">Return to login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
