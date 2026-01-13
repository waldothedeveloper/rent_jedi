"use client";

import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
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
import { bathroomOptions, bedroomOptions } from "@/utils/form-helpers";
import {
  completeMultiUnitProperty,
  updateMultipleUnits,
} from "@/app/actions/properties";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { unit } from "@/db/schema/units-schema";
import { useState } from "react";
import { z } from "zod";

// Zod schema for unit validation
const unitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit name is required."),
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

const unitsFormSchema = z.object({
  units: z.array(unitSchema).min(1, "At least one unit is required."),
});

type UnitFormValues = z.infer<typeof unitSchema> & { id?: string };

interface MultiUnitOptionFormProps {
  propertyId?: string;
  initialUnits?: (typeof unit.$inferSelect)[] | null;
}

export default function MultiUnitOptionForm({
  propertyId,
  initialUnits,
}: MultiUnitOptionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unitTypeParam = searchParams.get("unitType");
  const backHref = propertyId
    ? `/owners/properties/add-property/property-type?propertyId=${propertyId}&completedSteps=3${unitTypeParam ? `&unitType=${unitTypeParam}` : ""}`
    : "/owners/properties/add-property/property-type";
  const isEditMode = !!(initialUnits && initialUnits.length > 0);
  const [formError, setFormError] = useState<string | null>(null);

  // Store existing unit IDs for mapping during updates
  const existingUnits = initialUnits?.map((u) => ({ id: u.id, data: u })) || [];

  // Initialize unitIds based on existing units or default to one empty unit
  const initialUnitIds =
    initialUnits && initialUnits.length > 0
      ? initialUnits.map(() => crypto.randomUUID())
      : [crypto.randomUUID()];

  const [unitIds, setUnitIds] = useState<string[]>(initialUnitIds);
  const moreThanOneUnit = unitIds.length > 1;

  // Initialize form values from existing units or with empty defaults
  const initialFormValues =
    initialUnits && initialUnits.length > 0
      ? initialUnits.map((unit) => ({
          unitNumber: unit.unitNumber || "",
          bedrooms: unit.bedrooms?.toString() || "",
          bathrooms: unit.bathrooms?.toString() || "",
          rentAmount: unit.rentAmount || "",
          securityDepositAmount: unit.securityDepositAmount || "",
        }))
      : [
          {
            unitNumber: "",
            bedrooms: "",
            bathrooms: "",
            rentAmount: "",
            securityDepositAmount: "",
          },
        ];

  const form = useForm({
    defaultValues: {
      units: initialFormValues as UnitFormValues[],
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: unitsFormSchema,
      onDynamic: unitsFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null); // Clear previous errors

      try {
        if (!propertyId) {
          const errorMsg = "Property ID is missing. Please start from step 1.";
          setFormError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        // Edit mode → Update existing units + create new ones
        if (isEditMode) {
          const updates = value.units.map((unitData, index) => ({
            unitId: existingUnits[index]?.id, // Will be undefined for new units
            unitData,
          }));

          const result = await updateMultipleUnits(propertyId, updates);

          if (!result.success) {
            const errorMsg = result.message || "Failed to update units";
            setFormError(errorMsg);
            toast.error(errorMsg);
            return;
          }

          toast.success("Units updated successfully!");
          router.push("/owners/properties");
          return;
        }

        // Create mode → Create all units and activate property
        const result = await completeMultiUnitProperty({
          propertyId,
          units: value.units,
        });

        if (!result.success) {
          const errorMsg =
            result.message ||
            "Failed to create units. Try again or contact support.";
          setFormError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        toast.success(
          `Property with ${value.units.length} unit${value.units.length > 1 ? "s" : ""} created successfully!`
        );

        router.push("/owners/properties");
      } catch (error) {
        // Catch unexpected errors (network issues, etc.)
        const errorMsg =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  const addUnit = () => {
    const newId = crypto.randomUUID();
    setUnitIds((prev) => [...prev, newId]);

    // Add a new empty unit to the form
    const currentUnits = form.getFieldValue("units") || [];
    form.setFieldValue("units", [
      ...currentUnits,
      {
        unitNumber: "",
        bedrooms: "",
        bathrooms: "",
        rentAmount: "",
        securityDepositAmount: "",
      },
    ]);
  };

  const removeUnit = (index: number) => {
    if (unitIds.length <= 1) {
      toast.error("You must have at least one unit");
      return;
    }

    setUnitIds((prev) => prev.filter((_, i) => i !== index));

    // Remove the unit from form values
    const currentUnits = form.getFieldValue("units") || [];
    form.setFieldValue(
      "units",
      currentUnits.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Multi-Unit Details</h1>
          <p className="text-sm text-muted-foreground">
            Add details about each unit in your property.
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
            <div className="space-y-6">
              {unitIds.map((unitId, index) => (
                <FieldSet key={unitId} className="gap-4 relative">
                  <div className="flex items-center justify-between">
                    <FieldLegend>Unit {index + 1}</FieldLegend>
                    {moreThanOneUnit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUnit(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <form.Field name={`units[${index}].unitNumber`}>
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={`unit-${index}-number`}>
                          Unit Name
                        </FieldLabel>
                        <Input
                          id={`unit-${index}-number`}
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder="e.g., 101, A, Unit 1"
                          className={cn(
                            "w-full",
                            field.state.meta.errors.length > 0 &&
                              "border-destructive"
                          )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  </form.Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name={`units[${index}].bedrooms`}>
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={`unit-${index}-bedrooms`}>
                            Bedrooms
                          </FieldLabel>
                          <Select
                            value={field.state.value ?? ""}
                            onValueChange={(value) => {
                              field.handleChange(value);
                            }}
                          >
                            <SelectTrigger
                              id={`unit-${index}-bedrooms`}
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
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name={`units[${index}].bathrooms`}>
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={`unit-${index}-bathrooms`}>
                            Bathrooms
                          </FieldLabel>
                          <Select
                            value={field.state.value ?? ""}
                            onValueChange={(value) => {
                              field.handleChange(value);
                            }}
                          >
                            <SelectTrigger
                              id={`unit-${index}-bathrooms`}
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
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
                      )}
                    </form.Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <form.Field name={`units[${index}].rentAmount`}>
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={`unit-${index}-rent`}>
                            Monthly Rent
                          </FieldLabel>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              $
                            </span>
                            <Input
                              id={`unit-${index}-rent`}
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
                    </form.Field>

                    <form.Field name={`units[${index}].securityDepositAmount`}>
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={`unit-${index}-deposit`}>
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
                              id={`unit-${index}-deposit`}
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
                    </form.Field>
                  </div>
                </FieldSet>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addUnit}
                className="w-full"
              >
                <Plus className="size-4 mr-2" />
                Add Another Unit
              </Button>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-destructive/10 p-4"
              >
                <p className="text-sm font-semibold text-destructive mb-1">
                  Unable to save units
                </p>
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <Field>
              <FieldDescription>
                Add all the units you plan to rent out. You can add more units
                later.
              </FieldDescription>
              <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href={backHref}>← Back</Link>
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      // disabled={!canSubmit || isSubmitting}
                      className="flex items-center justify-center gap-2"
                    >
                      {isSubmitting
                        ? isEditMode
                          ? "Updating..."
                          : "Creating property..."
                        : isEditMode
                          ? "Update property"
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
