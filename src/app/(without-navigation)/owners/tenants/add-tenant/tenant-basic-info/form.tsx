"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  createTenantDraft,
  updateTenantDraftBasicInfo,
} from "@/app/actions/tenants";
import {
  formatPhoneFromE164,
  formatToPhone,
  tenantBasicInfoSchema,
} from "@/utils/form-helpers";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { tenant } from "@/db/schema/tenants-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TenantBasicInfoFormProps {
  tenantId?: string;
  initialData?: typeof tenant.$inferSelect | null;
}

export default function TenantBasicInfoForm({
  tenantId,
  initialData,
}: TenantBasicInfoFormProps) {
  const router = useRouter();
  const isEditMode = !!tenantId && !!initialData;
  const [formError, setFormError] = useState<string | null>(null);
  const [firstName, ...lastNameParts] = initialData?.name?.split(" ") || [""];
  const lastName = lastNameParts.join(" ");

  const defaultValues = {
    firstName: initialData?.name ? firstName : "",
    lastName: initialData?.name ? lastName : "",
    email: initialData?.email || "",
    phone: initialData?.phone ? formatPhoneFromE164(initialData.phone) : "",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: tenantBasicInfoSchema,
      onDynamic: tenantBasicInfoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        let newTenant;

        if (isEditMode && tenantId) {
          let updateTenant = await updateTenantDraftBasicInfo(tenantId, value);
          if (!updateTenant.success) {
            setFormError(updateTenant.message || "Failed to update tenant");
            toast.error(updateTenant.message || "Failed to update tenant");
            return;
          }
        } else {
          newTenant = await createTenantDraft(value);
          if (!newTenant.success) {
            setFormError(newTenant.message || "Failed to create tenant");
            toast.error(newTenant.message || "Failed to create tenant");
            return;
          }
        }

        toast.success("Tenant information saved!");

        router.push(
          `/owners/tenants/add-tenant/lease-dates?tenantId=${tenantId || newTenant?.tenantId}&completedSteps=1`
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to proceed to next step";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Tenant Information</h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s start by adding the tenant&apos;s basic contact
            information.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <FieldSet className="gap-4">
              {/* First Name */}
              <form.Field
                name="firstName"
                children={(field) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className={
                        field.state.meta.errors.length > 0
                          ? "text-destructive"
                          : ""
                      }
                    >
                      First Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="John"
                      autoFocus
                      className={cn(
                        field.state.meta.errors.length > 0
                          ? "border-destructive"
                          : ""
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Last Name */}
              <form.Field
                name="lastName"
                children={(field) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className={
                        field.state.meta.errors.length > 0
                          ? "text-destructive"
                          : ""
                      }
                    >
                      Last Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Doe"
                      className={cn(
                        field.state.meta.errors.length > 0
                          ? "border-destructive"
                          : ""
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Email */}
              <form.Field
                name="email"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Email{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <FieldDescription>
                      At least one of email or phone is required.
                    </FieldDescription>
                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="john.doe@example.com"
                      className={cn(
                        field.state.meta.errors.length > 0
                          ? "border-destructive"
                          : ""
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Phone */}
              <form.Field
                name="phone"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Phone{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <FieldDescription>
                      At least one of email or phone is required.
                    </FieldDescription>
                    <Input
                      id={field.name}
                      type="tel"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        formatToPhone(e);
                        field.handleChange(e.target.value);
                      }}
                      placeholder="(555) 555 - 5555"
                      className={cn(
                        field.state.meta.errors.length > 0
                          ? "border-destructive"
                          : ""
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            </FieldSet>

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-destructive/10 p-4"
              >
                <p className="text-sm font-semibold text-destructive mb-1">
                  Unable to proceed
                </p>
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <Field>
              <div className="flex justify-end">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex items-center justify-center gap-2"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : "Continue to Lease Dates"}
                      <ArrowRight className="size-4 text-muted" />
                    </Button>
                  )}
                />
              </div>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
