"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  addressFormSchema,
  controlClassName,
  usStateOptions,
} from "@/app/(without-navigation)/owners/properties/form-helpers";
import {
  createPropertyDraft,
  updatePropertyDraft,
} from "@/app/actions/properties";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { property } from "@/db/schema/properties-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

interface AddPropertyAddressFormProps {
  propertyId?: string;
  initialData?: typeof property.$inferSelect | null;
}

export default function AddPropertyAddressForm({
  propertyId,
  initialData,
}: AddPropertyAddressFormProps) {
  const router = useRouter();
  const isEditMode = !!propertyId && !!initialData;

  const defaultValues = {
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    country: initialData?.country || "United States",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: addressFormSchema,
      onDynamic: addressFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Edit mode → Update existing property
      if (isEditMode && propertyId) {
        const result = await updatePropertyDraft({
          propertyId,
          addressLine1: value.addressLine1,
          addressLine2: value.addressLine2,
          city: value.city,
          state: value.state,
          zipCode: value.zipCode,
          country: value.country,
        });

        if (!result.success) {
          throw new Error(result.message || "Failed to update address");
        }

        toast.success("Address updated!");
        router.push(
          `/owners/properties/add-property/property-type?propertyId=${propertyId}&completedSteps=1`
        );
        return;
      }

      // Create mode → Create new property
      const result = await createPropertyDraft(
        value as z.infer<typeof addressFormSchema>
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to save address");
      }

      toast.success("Address saved! Moving to next step...");
      router.push(
        `/owners/properties/add-property/property-type?propertyId=${result.propertyId}&completedSteps=1`
      );
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Property Address</h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s start by adding the location of your property.
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
              <FieldLegend>Location</FieldLegend>
              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="addressLine1"
                  children={(field) => (
                    <Field className="md:col-span-2">
                      <FieldLabel
                        htmlFor={field.name}
                        className={
                          field.state.meta.errors.length > 0
                            ? "text-destructive"
                            : ""
                        }
                      >
                        Street address
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="123 Main St"
                        autoComplete="address-line1"
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
                <form.Field
                  name="addressLine2"
                  children={(field) => (
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor={field.name}>
                        Apartment, suite, etc. (optional)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="Unit 4B"
                        autoComplete="address-line2"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
                <form.Field
                  name="city"
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
                        City
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        autoComplete="address-level2"
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
                <form.Field
                  name="state"
                  children={(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className={
                          field.state.meta.errors.length > 0
                            ? "border-destructive text-destructive"
                            : ""
                        }
                      >
                        State / Territory
                      </FieldLabel>
                      <select
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        autoComplete="address-level1"
                        className={cn(
                          controlClassName,
                          "h-9",
                          field.state.meta.errors.length > 0
                            ? "border-destructive text-destructive"
                            : ""
                        )}
                      >
                        <option value="" disabled>
                          Select a state
                        </option>
                        {usStateOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <FieldError errors={field.state.meta.errors} />
                      <FieldDescription>
                        US states and territories only.
                      </FieldDescription>
                    </Field>
                  )}
                />
                <form.Field
                  name="zipCode"
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
                        ZIP / Postal code
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="94110"
                        autoComplete="postal-code"
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
                <form.Field
                  name="country"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                      <Input
                        id={field.name}
                        value="United States"
                        readOnly
                        className="cursor-not-allowed bg-muted"
                        autoComplete="country-name"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </FieldSet>

            <Field>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="flex items-center justify-center gap-2"
                  >
                    {isSubmitting
                      ? isEditMode
                        ? "Updating..."
                        : "Saving..."
                      : isEditMode
                        ? "Update & Continue"
                        : "Continue to step 2"}
                    <ArrowRight className="size-4 text-muted" />
                  </Button>
                )}
              />
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
