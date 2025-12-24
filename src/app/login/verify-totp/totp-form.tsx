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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { totpSchema } from "@/lib/shared-auth-schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { verifyTotpAction } from "@/app/actions/auth";

export function InputOTPForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      pin: "",
      trustDevice: false,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: totpSchema,
      onDynamic: totpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null);
      const response = await verifyTotpAction({
        pin: value.pin,
        trustDevice: value.trustDevice ?? false,
      });

      if (!response?.success) {
        setServerError(
          response?.message ?? "Unable to verify code. Try again."
        );
        toast.error(response?.message ?? "Unable to verify code. Try again.");
        return;
      }

      toast.success("Code successfully verified!");
      setServerError(null);
      router.push(response.redirectTo ?? "/owners/dashboard");
      router.refresh();
      formApi.reset();
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify it&apos;s you</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <FieldGroup>
              <form.Field
                name="pin"
                children={(field) => (
                  <Field className="items-center">
                    <FieldLabel htmlFor={field.name}>
                      One-Time Password
                    </FieldLabel>
                    <InputOTP
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(value) => field.handleChange(value)}
                      maxLength={6}
                      containerClassName="w-full justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-10" />
                        <InputOTPSlot index={1} className="h-12 w-10" />
                        <InputOTPSlot index={2} className="h-12 w-10" />
                        <InputOTPSlot index={3} className="h-12 w-10" />
                        <InputOTPSlot index={4} className="h-12 w-10" />
                        <InputOTPSlot index={5} className="h-12 w-10" />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldError errors={field.state.meta.errors} />
                    <FieldDescription className="text-center">
                      Check your authenticator for the latest code.
                    </FieldDescription>
                    {serverError ? (
                      <FieldError>{serverError}</FieldError>
                    ) : null}
                  </Field>
                )}
              />
              <form.Field
                name="trustDevice"
                children={(field) => (
                  <Field
                    className="w-fit items-center gap-2"
                    orientation="horizontal"
                  >
                    <Checkbox
                      id={field.name}
                      checked={field.state.value ?? false}
                      onCheckedChange={(checked) =>
                        field.handleChange(Boolean(checked))
                      }
                      onBlur={field.handleBlur}
                    />
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Trust this device
                    </Label>
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
                      disabled={!canSubmit || isSubmitting || isPristine}
                    >
                      {isSubmitting ? "Verifying..." : "Verify and continue"}
                    </Button>
                  )}
                />
                <FieldDescription className="text-center space-x-6">
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Back to login
                  </Link>{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </Link>{" "}
                  <Link
                    href="/contact-support"
                    className="font-medium text-primary hover:underline"
                  >
                    Contact help
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
