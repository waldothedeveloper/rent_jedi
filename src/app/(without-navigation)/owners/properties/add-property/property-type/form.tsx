"use client";

import {
  unitTypeOptions,
  type UnitType,
} from "@/app/(without-navigation)/owners/properties/form-helpers";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { updatePropertyDraft } from "@/app/actions/properties";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { property } from "@/db/schema/properties-schema";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

const propertyTypeSchema = z.object({
  unitType: z.enum(unitTypeOptions, {
    message: "Please select a unit type.",
  }),
});

interface AddPropertyPropertyTypeFormProps {
  propertyId?: string;
  initialData?: typeof property.$inferSelect | null;
}

export default function AddPropertyPropertyTypeForm({
  propertyId,
  initialData,
}: AddPropertyPropertyTypeFormProps) {
  const router = useRouter();

  const defaultValues: { unitType: UnitType | "" } = {
    unitType: initialData?.unitType || "",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: propertyTypeSchema,
      onDynamic: propertyTypeSchema,
    },
    onSubmit: async ({ value }) => {
      if (!propertyId) {
        throw new Error("Property ID is missing. Please start from step 1.");
      }

      const result = await updatePropertyDraft({
        propertyId,
        unitType: value.unitType as UnitType,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to save property type");
      }

      toast.success("Property type saved! Moving to next step...");

      // Navigate to appropriate step based on unit type
      const completedSteps = 2; // Address + Unit Type completed
      if (value.unitType === "single_unit") {
        router.push(
          `/owners/properties/add-property/single-unit-option?propertyId=${propertyId}&completedSteps=${completedSteps}&unitType=${value.unitType}`
        );
      } else {
        router.push(
          `/owners/properties/add-property/multi-unit-option?propertyId=${propertyId}&completedSteps=${completedSteps}&unitType=${value.unitType}`
        );
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Property Type</h1>
          <p className="text-sm text-muted-foreground">
            Tell us how you plan to rent out this property.
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
              <form.Field
                name="unitType"
                children={(field) => (
                  <Field>
                    <FieldLabel
                      className={
                        field.state.meta.errors.length > 0
                          ? "border-destructive text-destructive"
                          : ""
                      }
                      htmlFor={field.name}
                    >
                      Property Type
                    </FieldLabel>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(value as UnitType)
                      }
                      onBlur={field.handleBlur}
                      className={cn(
                        "grid gap-3 sm:grid-cols-2",
                        field.state.meta.errors.length > 0
                          ? "border-destructive text-destructive"
                          : ""
                      )}
                    >
                      {unitTypeOptions.map((option) => {
                        const isSingle = option === "single_unit";
                        const id = isSingle ? "unit-single" : "unit-multi";
                        const label = isSingle
                          ? "Single-unit property"
                          : "Multi-unit property";

                        return (
                          <div
                            key={option}
                            className={cn(
                              "flex items-center gap-3 rounded-md border p-3",
                              field.state.meta.errors.length > 0
                                ? "border-destructive"
                                : ""
                            )}
                          >
                            <RadioGroupItem
                              value={option}
                              id={id}
                              className={
                                field.state.meta.errors.length > 0
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                            <Label htmlFor={id}>{label}</Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                    <FieldError errors={field.state.meta.errors} />
                    <FieldDescription>
                      This will help us know if you will be renting individual
                      units such as bedrooms within a property, or the entire
                      property as a whole.
                    </FieldDescription>
                  </Field>
                )}
              />
            </FieldSet>

            <Field>
              <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  ← Back
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Saving..." : "Continue to step 3"}
                      <ArrowUpRight className="size-4 text-muted" />
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
