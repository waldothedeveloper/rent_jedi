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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  completeSingleUnitProperty,
  updateUnit,
} from "@/app/actions/properties";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { unit } from "@/db/schema/units-schema";
import { useRouter } from "next/navigation";
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

// Schema for single-unit property completion
const singleUnitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit number is required."),
  bedrooms: z.string().min(1, "Please select number of bedrooms."),
  bathrooms: z.string().min(1, "Please select number of bathrooms."),
  rentAmount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{0,2})?$/, "Must be a valid amount (e.g., 1500.00).")
    .refine((val) => Number(val) >= 0, "Rent amount must be 0 or greater."),
  securityDepositAmount: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || /^\d+(\.\d{0,2})?$/.test(val),
      "Must be a valid amount (e.g., 1500.00)."
    )
    .refine(
      (val) => val === "" || Number(val) >= 0,
      "Security deposit must be 0 or greater."
    ),
});

interface SingleUnitOptionFormProps {
  propertyId?: string;
  initialUnit?: typeof unit.$inferSelect | null;
}

export default function SingleUnitOptionForm({
  propertyId,
  initialUnit,
}: SingleUnitOptionFormProps) {
  const router = useRouter();
  const isEditMode = !!initialUnit;
  const existingUnitId = initialUnit?.id;

  const defaultValues = {
    unitNumber: initialUnit?.unitNumber || "",
    bedrooms: initialUnit?.bedrooms?.toString() || "",
    bathrooms: initialUnit?.bathrooms?.toString() || "",
    rentAmount: initialUnit?.rentAmount || "",
    securityDepositAmount: initialUnit?.securityDepositAmount || "",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: singleUnitSchema,
      onDynamic: singleUnitSchema,
    },
    onSubmit: async ({ value }) => {
      if (!propertyId) {
        throw new Error("Property ID is missing. Please start from step 1.");
      }

      // Edit mode → Update existing unit
      if (isEditMode && existingUnitId) {
        const result = await updateUnit(existingUnitId, value);

        if (!result.success) {
          throw new Error(result.message || "Failed to update unit");
        }

        toast.success("Unit updated successfully!");
        router.push("/owners/properties");
        return;
      }

      // Create mode → Create new unit and activate property
      const result = await completeSingleUnitProperty({
        propertyId,
        unitData: value,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to complete property");
      }

      toast.success("Property created successfully!");
      router.push("/owners/properties");
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Single Unit Details</h1>
          <p className="text-sm text-muted-foreground">
            Add details about your single-unit property.
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
              <FieldLegend>Unit Information</FieldLegend>

              {/* Unit Number */}
              <form.Field
                name="unitNumber"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Unit Name (or Number)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g., Main Unit, 101, A"
                      className={cn(
                        "w-full",
                        field.state.meta.errors.length > 0 &&
                          "border-destructive"
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Bedrooms and Bathrooms */}
              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="bedrooms"
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
                  name="bathrooms"
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
              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="rentAmount"
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
                          className={cn(
                            "w-full pl-7",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive"
                          )}
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="securityDepositAmount"
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
            </FieldSet>

            <Field>
              <FieldDescription>
                This information will help renters understand what they're
                getting.
              </FieldDescription>
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
                      {isSubmitting
                        ? isEditMode
                          ? "Updating unit..."
                          : "Creating property..."
                        : isEditMode
                          ? "Update unit"
                          : "Create property"}
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
