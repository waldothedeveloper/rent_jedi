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
  controlClassName,
  propertyNameFormSchema,
} from "@/app/(without-navigation)/owners/properties/form-helpers";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { property } from "@/db/schema/properties-schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PropertyNameAndDescriptionFormProps {
  propertyId?: string;
  initialData?: typeof property.$inferSelect | null;
}

export default function PropertyNameAndDescriptionForm({
  propertyId,
  initialData,
}: PropertyNameAndDescriptionFormProps) {
  const router = useRouter();
  const isEditMode = !!propertyId && !!initialData;
  const [formError, setFormError] = useState<string | null>(null);

  // Read from localStorage using lazy initialization (runs once on mount)
  // This ensures the form gets the localStorage values on first render
  const [nameFromStorage] = useState(() => {
    if (typeof window !== "undefined" && !isEditMode) {
      return localStorage.getItem("draft-property-name") || "";
    }
    return "";
  });

  const [descriptionFromStorage] = useState(() => {
    if (typeof window !== "undefined" && !isEditMode) {
      return localStorage.getItem("draft-property-description") || "";
    }
    return "";
  });

  const defaultValues = {
    name: initialData?.name || nameFromStorage || "",
    description: initialData?.description || descriptionFromStorage || "",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: propertyNameFormSchema,
      onDynamic: propertyNameFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        localStorage.setItem("draft-property-name", value.name);
        localStorage.setItem(
          "draft-property-description",
          value.description || ""
        );

        if (isEditMode && propertyId) {
          router.push(
            `/owners/properties/add-property/address?propertyId=${propertyId}&completedSteps=1`
          );
        } else {
          router.push("/owners/properties/add-property/address");
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to proceed to next step";
        setFormError(errorMsg);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">
            Property Name & Description
          </h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s start by giving your property a name and description.
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
              {/* Property Name Field */}
              <form.Field
                name="name"
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
                      Property Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldDescription>
                      Give your property a memorable name (e.g., &quot;Sunset
                      Apartments&quot;, &quot;123 Main Street&quot;).
                    </FieldDescription>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      className={cn(
                        controlClassName,
                        field.state.meta.errors.length > 0
                          ? "border-destructive"
                          : ""
                      )}
                      placeholder="Enter property name"
                      autoFocus
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Property Description Field */}
              <form.Field
                name="description"
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
                      Property Description{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <FieldDescription>
                      Add any details about the property that tenants should
                      know (max 2000 characters).
                    </FieldDescription>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      className={cn(
                        controlClassName,
                        field.state.meta.errors.length > 0
                          ? "border-destructive"
                          : ""
                      )}
                      placeholder="Enter property description (optional)"
                      rows={4}
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
                      {isSubmitting ? "Processing..." : "Continue to Address"}
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
