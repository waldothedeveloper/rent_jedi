"use client";

import { leaseDatesSchema } from "@/utils/form-helpers";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updateTenantDraftLeaseDates } from "@/app/actions/tenants";
import { tenant } from "@/db/schema/tenants-schema";
import { toast } from "sonner";

interface LeaseDatesFormProps {
  tenantId?: string;
  initialData?: typeof tenant.$inferSelect | null;
}

export default function LeaseDatesForm({
  tenantId,
  initialData,
}: LeaseDatesFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  // Format dates to YYYY-MM-DD for date input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const defaultValues = {
    leaseStartDate: initialData?.leaseStartDate
      ? formatDateForInput(initialData.leaseStartDate)
      : "",
    leaseEndDate: initialData?.leaseEndDate
      ? formatDateForInput(initialData.leaseEndDate)
      : "",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: leaseDatesSchema,
      onDynamic: leaseDatesSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      if (!tenantId) {
        setFormError("Missing tenant ID. Please start over from Step 1.");
        toast.error("Missing tenant ID. Please start over from Step 1.");
        return;
      }

      try {
        // Update tenant draft in database
        const result = await updateTenantDraftLeaseDates(tenantId, value);

        if (!result.success) {
          setFormError(result.message || "Failed to update lease dates");
          toast.error(result.message || "Failed to update lease dates");
          return;
        }

        toast.success("Lease dates saved!");

        // Navigate to Step 3 with tenantId
        router.push(
          `/owners/tenants/add-tenant/unit-selection?tenantId=${tenantId}&completedSteps=2`
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
          <h1 className="text-2xl font-semibold">Lease Dates</h1>
          <p className="text-sm text-muted-foreground">
            Specify the lease start and end dates for this tenant.
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
              {/* Lease Start Date */}
              <form.Field
                name="leaseStartDate"
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
                      Lease Start Date{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldDescription>
                      The date when the lease begins.
                    </FieldDescription>
                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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

              {/* Lease End Date */}
              <form.Field
                name="leaseEndDate"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Lease End Date{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <FieldDescription>
                      Leave blank for month-to-month or ongoing leases.
                    </FieldDescription>
                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
              <div className="flex items-center justify-between gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href={`/owners/tenants/add-tenant/tenant-basic-info?tenantId=${tenantId}&completedSteps=1`}>
                    ← Back
                  </Link>
                </Button>
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
                        : "Continue to Unit Selection"}
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
