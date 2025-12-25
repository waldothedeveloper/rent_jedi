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
import { forgotPasswordSchema } from "@/lib/shared-auth-schema";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { toast } from "sonner";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: forgotPasswordSchema,
      onDynamic: forgotPasswordSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await requestPasswordResetAction(value);
        toast.success("Check your email for reset instructions.");
        formApi.reset();
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
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="email"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      autoComplete="email"
                      id={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                      disabled={!canSubmit || isSubmitting || isPristine}
                      className="w-full"
                    >
                      {isSubmitting
                        ? "Sending reset link..."
                        : "Send reset link"}
                    </Button>
                  )}
                />

                <FieldDescription className="text-center">
                  Remembered your password? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
