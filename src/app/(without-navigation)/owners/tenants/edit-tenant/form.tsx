"use client";

import { ArrowLeft, Save } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  formatPhoneFromE164,
  formatToDateValue,
  formatToPhone,
} from "@/utils/form-helpers";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { editTenantSchema } from "@/utils/shared-schemas";
import type { tenant } from "@/db/schema/tenants-schema";
import { toast } from "sonner";
import { updateTenant } from "@/app/actions/tenants";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EditTenantFormProps {
  tenant: typeof tenant.$inferSelect & {
    unit?: { id: string; unitNumber: string | null } | null;
    property?: { id: string; name: string | null } | null;
  };
}

export default function EditTenantForm({ tenant }: EditTenantFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  // Construct return URL to show this tenant's details
  const returnUrl = `/owners/tenants?tenantId=${tenant.id}`;

  const [firstName, ...lastNameParts] = tenant.name.split(" ");
  const lastName = lastNameParts.join(" ");

  const initialFormValues = {
    firstName: firstName || "",
    lastName: lastName || "",
    email: tenant.email || "",
    phone: tenant.phone ? formatPhoneFromE164(tenant.phone) : "",
    leaseStartDate: tenant.leaseStartDate
      ? formatToDateValue(tenant.leaseStartDate)
      : "",
    leaseEndDate: tenant.leaseEndDate
      ? formatToDateValue(tenant.leaseEndDate)
      : "",
  };

  const form = useForm({
    defaultValues: initialFormValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: editTenantSchema,
      onDynamic: editTenantSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        const result = await updateTenant(tenant.id, value);

        if (!result.success) {
          setFormError(result.message || "Failed to update tenant");
          toast.error(result.message || "Failed to update tenant");
          return;
        }

        toast.success("Tenant updated successfully!");
        router.push(returnUrl);
        router.refresh();
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to update tenant";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Edit Tenant</h1>
            <p className="text-sm text-muted-foreground">
              Update tenant information and lease details.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={returnUrl}>
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
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
            <FieldSet className="gap-6">
              {/* Basic Information Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>

                <div className="grid gap-4 md:grid-cols-2">
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
                          className={cn(
                            field.state.meta.errors.length > 0
                              ? "border-destructive"
                              : "",
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
                              : "",
                          )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Contact Information</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Email */}
                  <form.Field
                    name="email"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Email{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                              : "",
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
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                              : "",
                          )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Property & Unit Information */}
              <div className="flex flex-col gap-4">
                {/* <h2 className="text-lg font-semibold">Property & Unit</h2>

                {tenant.property && tenant.unit && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground">
                      Current Assigned Property
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Unit '{tenant.unit.unitNumber}' in Property '
                      {tenant.property.name}'
                    </p>
                  </div>
                )} */}

                {!tenant.unitId && (
                  <div className="rounded-lg p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      No unit assigned
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This tenant is in draft status and needs to be assigned to
                      a unit.
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Lease Dates Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Lease Information</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Lease Start Date */}
                  <form.Field
                    name="leaseStartDate"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Lease Start Date{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="date"
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={cn(
                            field.state.meta.errors.length > 0
                              ? "border-destructive"
                              : "",
                          )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  {/* Lease End Date */}
                  <form.Field
                    name="leaseEndDate"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Lease End Date{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FieldLabel>

                        <Input
                          id={field.name}
                          type="date"
                          value={field.state.value || ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={cn(
                            field.state.meta.errors.length > 0
                              ? "border-destructive"
                              : "",
                          )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive bg-destructive/10 p-4"
                >
                  <p className="text-sm font-semibold text-destructive mb-1">
                    Unable to save changes
                  </p>
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-4">
                <Button type="button" variant="ghost" asChild>
                  <Link href={returnUrl}>Cancel</Link>
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Save className="size-4" />
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
