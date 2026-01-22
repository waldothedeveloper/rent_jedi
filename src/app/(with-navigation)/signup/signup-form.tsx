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
import { acceptTenantInviteWithSignup } from "@/app/actions/invites";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { signUpAction } from "@/app/actions/auth";
import { signUpSchema } from "@/lib/shared-auth-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SignupFormProps extends React.ComponentProps<"div"> {
  token?: string;
  role?: string;
}

export function SignupForm({
  token,
  role,
  className,
  ...props
}: SignupFormProps) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);

  const isTenant = role === "tenant";
  const title = isTenant ? "Set Up Your Tenant Account" : "Create your account";
  const description = isTenant
    ? "Complete your registration to access your rental dashboard"
    : "Every great landscape starts with a single place in the sun. Join us and find yours.";
  const submitButtonText = isTenant
    ? "Create Tenant Account"
    : "Join Bloom Rent";

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: signUpSchema,
      onDynamic: signUpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        if (token) {
          const result = await acceptTenantInviteWithSignup({
            ...value,
            token,
          });

          if (!result.success) {
            toast.error(result.message || "Failed to create account");
            return;
          }

          toast.success("Account created successfully!");
          router.push("/invite/welcome");
        } else {
          await signUpAction(value);
          toast.success("Account created! Please check your email.");
          formApi.reset();
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
      }
    },
  });

  // Validate token on mount and pre-populate form (acceptable useEffect use - initial data load)
  // useEffect(() => {
  //   if (token) {
  //     validateInviteToken(token).then((result) => {
  //       if (result.success && result.data) {
  //         const email = result.data.inviteeEmail;
  //         const name = result.data.inviteeName || "";
  //         setInviteEmail(email);
  //         setInviteName(name);
  //         // Update form values
  //         form.setFieldValue("email", email);
  //         form.setFieldValue("name", name);
  //       }
  //     });
  //   }
  // }, [token, form]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
                name="name"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      autoComplete="name"
                      id={field.name}
                      type="text"
                      placeholder="John Doe"
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
                name="email"
                children={(field) => {
                  const emailValue = inviteEmail || field.state.value || "";
                  const isReadOnly = !!inviteEmail;

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        autoComplete="email"
                        id={field.name}
                        type="email"
                        placeholder="m@example.com"
                        value={emailValue}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        className={isReadOnly ? "bg-muted" : ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                      />
                      {isReadOnly && (
                        <FieldDescription>
                          This invitation is for this email address
                        </FieldDescription>
                      )}
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  );
                }}
              />
              <Field className="grid grid-cols-2 gap-4">
                <form.Field
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        autoComplete="new-password"
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
                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Confirm Password
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
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </Field>

              <Field className="-mb-4">
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
                        ? "In progress, please wait..."
                        : submitButtonText}
                    </Button>
                  )}
                />
              </Field>

              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={async () => {
                    // Store role in sessionStorage before OAuth
                    if (role) {
                      sessionStorage.setItem("signup_role", role);
                    }

                    await authClient.signIn.social({
                      provider: "google",
                      callbackURL: "/auth-success",
                    });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Sign in</Link>
              </FieldDescription>
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
