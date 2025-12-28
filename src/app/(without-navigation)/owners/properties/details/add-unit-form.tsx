"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createUnits } from "@/app/actions/properties";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";

// Bedroom options
const bedroomOptions = [
  { value: "studio", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
  { value: "11", label: "11" },
  { value: "12+", label: "+12" },
];

// Bathroom options
const bathroomOptions = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "2" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3" },
  { value: "3.5", label: "3.5" },
  { value: "4", label: "4" },
  { value: "4.5", label: "4.5" },
  { value: "5", label: "5" },
  { value: "5.5", label: "5.5" },
  { value: "6", label: "6" },
  { value: "6.5", label: "6.5" },
  { value: "7", label: "7" },
  { value: "7.5", label: "7.5" },
  { value: "8", label: "8" },
  { value: "8.5", label: "8.5" },
  { value: "9", label: "9" },
  { value: "9.5", label: "9.5" },
  { value: "10", label: "10" },
  { value: "10.5", label: "10.5" },
  { value: "11", label: "11" },
  { value: "11.5", label: "11.5" },
  { value: "12+", label: "+12" },
];

// Zod schema for unit validation
const unitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit number is required."),
  bedrooms: z.string().min(1, "Please select number of bedrooms."),
  bathrooms: z.string().min(1, "Please select number of bathrooms."),
  rentAmount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{0,2})?$/, "Must be a valid amount (e.g., 1500.00).")
    .refine((val) => Number(val) >= 0, "Rent amount must be 0 or greater."),
  securityDepositAmount: z.preprocess(
    (val) => val ?? "",
    z
      .string()
      .trim()
      .refine(
        (val) => val === "" || /^\d+(\.\d{0,2})?$/.test(val),
        "Must be a valid amount (e.g., 1500.00)."
      )
      .refine(
        (val) => val === "" || Number(val) >= 0,
        "Security deposit must be 0 or greater."
      )
  ),
});

const unitsFormSchema = z.object({
  units: z.array(unitSchema).min(1, "At least one unit is required."),
});

type UnitFormValues = z.infer<typeof unitSchema> & { id?: string };

interface AddUnitFormProps {
  propertyId: string;
  className?: string;
}

export function AddUnitForm({ propertyId, className }: AddUnitFormProps) {
  const [unitIds, setUnitIds] = useState<string[]>([crypto.randomUUID()]);
  const moreThanOneUnit = unitIds.length > 1;

  const form = useForm({
    defaultValues: {
      units: unitIds.map(() => ({
        unitNumber: "",
        bedrooms: "",
        bathrooms: "",
        rentAmount: "",
        securityDepositAmount: "",
      })) as UnitFormValues[],
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: ({ value }) => {
        const result = unitsFormSchema.safeParse(value);
        if (!result.success) {
          return result.error;
        }
        return undefined;
      },
      onDynamic: ({ value }) => {
        const result = unitsFormSchema.safeParse(value);
        if (!result.success) {
          return result.error;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        const result = await createUnits({
          propertyId,
          units: value.units,
        });

        if (!result.success) {
          toast.error(
            result.message ||
              "Failed to create units. Try again or contact support."
          );
          return;
        }

        toast.success(
          `${value.units.length} unit${value.units.length > 1 ? "s" : ""} created successfully!`
        );

        // Reset form on success
        formApi.reset();

        // Reset to single unit
        setUnitIds([crypto.randomUUID()]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
      }
    },
  });

  const addUnit = () => {
    setUnitIds([...unitIds, crypto.randomUUID()]);
  };

  const removeUnit = (index: number) => {
    if (moreThanOneUnit) {
      // Remove from visual rendering
      setUnitIds(unitIds.filter((_, i) => i !== index));

      // Remove from form data
      const currentUnits = form.state.values.units;
      form.setFieldValue(
        "units",
        currentUnits.filter((_, i) => i !== index)
      );
    }
  };

  const clearAllUnits = () => {
    if (moreThanOneUnit) {
      // Keep only the first unit visually
      setUnitIds([unitIds[0]]);

      // Keep only the first unit's data
      const firstUnit = form.state.values.units[0];
      form.setFieldValue("units", [firstUnit]);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-12 max-w-2xl mx-auto py-8", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <h1 className="text-3xl font-light tracking-tight">Add Units</h1>
          <p className="text-muted-foreground">
            We need a few more details about this property to get started. Add
            one or more units below. Think of a unit as an individual rental
            space within your property. For example, it could be something as
            simple as an individual bedrooom in a house, or a full apartment in
            a multi-unit building.
          </p>
        </div>
        {moreThanOneUnit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllUnits}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All Units
          </Button>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-16"
      >
        {/* Units */}
        {unitIds.map((unitId, unitIndex) => (
          <div key={unitId} className="space-y-8">
            {/* Unit Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-light">Unit {unitIndex + 1}</h2>
                {moreThanOneUnit && (
                  <p className="text-sm text-muted-foreground mt-1">
                    of {unitIds.length}
                  </p>
                )}
              </div>
              {moreThanOneUnit && unitIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUnit(unitIndex)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="size-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            {/* Unit Fields */}
            <FieldGroup>
              {/* Unit Number */}
              <form.Field
                name={`units[${unitIndex}].unitNumber`}
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Unit Name (or Number){" "}
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g., 101, A, 1st Floor"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Bedrooms and Bathrooms */}
              <div className="grid gap-6 sm:grid-cols-2">
                <form.Field
                  name={`units[${unitIndex}].bedrooms`}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Bedrooms</FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(value) => {
                          field.handleChange(value);
                        }}
                      >
                        <SelectTrigger
                          id={field.name}
                          size="sm"
                          className={cn(
                            "w-full",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive"
                          )}
                          onBlur={field.handleBlur}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {bedroomOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name={`units[${unitIndex}].bathrooms`}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Bathrooms</FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(value) => {
                          field.handleChange(value);
                        }}
                      >
                        <SelectTrigger
                          id={field.name}
                          size="sm"
                          className={cn(
                            "w-full",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive"
                          )}
                          onBlur={field.handleBlur}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {bathroomOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>

              {/* Rent and Deposit */}
              <div className="grid gap-6 sm:grid-cols-2">
                <form.Field
                  name={`units[${unitIndex}].rentAmount`}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Monthly Rent</FieldLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder="1500.00"
                          className="pl-7"
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name={`units[${unitIndex}].securityDepositAmount`}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Security Deposit
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder="1500.00"
                          className="pl-7"
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            {/* Subtle separator between units */}
            {unitIndex < unitIds.length - 1 && (
              <div className="h-px bg-border/50 mt-8" />
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addUnit}
            className="w-full"
          >
            <Plus className="size-4 mr-2" />
            Add Another Unit
          </Button>

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
                  ? "Saving units..."
                  : `Save ${unitIds.length} unit${moreThanOneUnit ? "s" : ""}`}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  );
}
