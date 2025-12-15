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
  FieldSeparator,
} from "@/components/ui/field";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { loginAction } from "@/app/actions/auth";
import { loginSchema } from "@/lib/shared-auth-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: loginSchema,
      onDynamic: loginSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const res = await loginAction(value);

      if (!res?.success) {
        return toast.error(res?.message ?? "Login failed. Try again.");
      }

      router.push(res.redirectTo ?? "/dashboard");
      router.refresh();
      formApi.reset();
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Login to your Account</CardTitle>
          <CardDescription>Make your rentals flourish.</CardDescription>
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
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={async () => {
                    await authClient.signIn.social({
                      provider: "google",
                      callbackURL: "/dashboard",
                    });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
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
              <form.Field
                name="password"
                children={(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      autoComplete="current-password"
                      id={field.name}
                      type="password"
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
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  )}
                />

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="/terms-of-service">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
