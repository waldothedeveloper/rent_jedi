"use client";

import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
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
  bathroomOptions,
  bathroomsToString,
  bedroomOptions,
  bedroomsToString,
  controlClassName,
  formatLabel,
  formatPhoneFromE164,
  formatToPhone,
  propertyStatusSelectOptions,
  propertyTypeOptions,
  usStateOptions,
} from "@/app/(without-navigation)/owners/properties/form-helpers";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
  updateMultipleUnits,
  updatePropertyDraft,
} from "@/app/actions/properties";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { editPropertyFormSchema } from "./schema";
import type { property } from "@/db/schema/properties-schema";
import { toast } from "sonner";
import type { unit } from "@/db/schema/units-schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EditPropertyFormProps {
  property: typeof property.$inferSelect;
  units: (typeof unit.$inferSelect)[];
}

export default function EditPropertyForm({
  property,
  units,
}: EditPropertyFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const existingUnits = units.map((u) => ({ id: u.id, data: u }));
  const initialUnitIds =
    units.length > 0
      ? units.map(() => crypto.randomUUID())
      : [crypto.randomUUID()];

  const [unitIds, setUnitIds] = useState<string[]>(initialUnitIds);
  const moreThanOneUnit = unitIds.length > 1;

  const initialFormValues = {
    propertyId: property.id,
    name: property.name || "",
    description: property.description || "",
    propertyStatus: property.propertyStatus,
    contactEmail: property.contactEmail || "",
    contactPhone: formatPhoneFromE164(property.contactPhone),
    propertyType: property.propertyType || "",
    unitType: property.unitType || ("single_unit" as const),
    addressLine1: property.addressLine1,
    addressLine2: property.addressLine2 || "",
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    country: property.country || "United States",
    yearBuilt: property.yearBuilt?.toString() || "",
    buildingSqFt: property.buildingSqFt?.toString() || "",
    lotSqFt: property.lotSqFt?.toString() || "",
    units:
      units.length > 0
        ? units.map((u) => ({
            id: u.id,
            unitNumber: u.unitNumber || "",
            bedrooms: bedroomsToString(u.bedrooms),
            bathrooms: bathroomsToString(u.bathrooms),
            rentAmount: u.rentAmount || "",
            securityDepositAmount: u.securityDepositAmount || "",
          }))
        : [
            {
              unitNumber: "",
              bedrooms: "",
              bathrooms: "",
              rentAmount: "",
              securityDepositAmount: "",
            },
          ],
  };

  const form = useForm({
    defaultValues: initialFormValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: editPropertyFormSchema,
      onDynamic: editPropertyFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      try {
        const yearBuiltNum = value.yearBuilt
          ? Number(value.yearBuilt)
          : undefined;
        const buildingSqFtNum = value.buildingSqFt
          ? Number(value.buildingSqFt)
          : undefined;
        const lotSqFtNum = value.lotSqFt ? Number(value.lotSqFt) : undefined;

        const propertyResult = await updatePropertyDraft({
          propertyId: value.propertyId,
          name: value.name,
          description: value.description || undefined,
          propertyType: value.propertyType
            ? (value.propertyType as (typeof propertyTypeOptions)[number])
            : undefined,
          unitType: value.unitType,
          addressLine1: value.addressLine1,
          addressLine2: value.addressLine2 || undefined,
          city: value.city,
          state: value.state,
          zipCode: value.zipCode,
          country: value.country,
          contactEmail: value.contactEmail || undefined,
          contactPhone: value.contactPhone || undefined,
          yearBuilt: yearBuiltNum,
          buildingSqFt: buildingSqFtNum,
          lotSqFt: lotSqFtNum,
        });

        if (!propertyResult.success) {
          const errorMsg =
            propertyResult.message || "Failed to update property";
          setFormError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        const unitUpdates = value.units.map((unitData, index) => ({
          unitId: existingUnits[index]?.id,
          unitData: {
            unitNumber: unitData.unitNumber,
            bedrooms: unitData.bedrooms,
            bathrooms: unitData.bathrooms,
            rentAmount: unitData.rentAmount,
            securityDepositAmount: unitData.securityDepositAmount,
          },
        }));

        const unitsResult = await updateMultipleUnits(
          value.propertyId,
          unitUpdates
        );

        if (!unitsResult.success) {
          const errorMsg = unitsResult.message || "Failed to update units";
          setFormError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        toast.success("Property updated successfully!");
        router.push(`/owners/properties/details?id=${value.propertyId}`);
      } catch (error) {
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

    const currentUnits = form.getFieldValue("units") || [];
    form.setFieldValue(
      "units",
      currentUnits.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Edit Property</h1>
            <p className="text-sm text-muted-foreground">
              Update your property details and units.
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href={`/owners/properties/details?id=${property.id}`}>
              <ArrowLeft className="size-4 mr-2" />
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
          className="flex flex-col gap-8"
        >
          {/* Section: Basic Information */}
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend className="text-lg font-medium">
                Basic Information
              </FieldLegend>

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
                      Property Name
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      autoComplete="organization"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g., Sunset Apartments"
                      className={cn(
                        controlClassName,
                        field.state.meta.errors.length > 0 &&
                          "border-destructive"
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <form.Field
                name="description"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Description
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Describe your property..."
                      rows={3}
                      className={cn(
                        controlClassName,
                        field.state.meta.errors.length > 0 &&
                          "border-destructive"
                      )}
                    />
                    <FieldDescription>Maximum 2000 characters</FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <form.Field
                name="propertyStatus"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Property Status
                    </FieldLabel>
                    <Select
                      value={field.state.value ?? ""}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as
                            | "draft"
                            | "active"
                            | "coming_soon"
                            | "archived"
                        )
                      }
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
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyStatusSelectOptions.map((option) => (
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
            </FieldSet>
          </FieldGroup>

          <Separator />

          {/* Section: Contact Information */}
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend className="text-lg font-medium">
                Contact Information
              </FieldLegend>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="contactEmail"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Contact Email
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        autoComplete="email"
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="contact@example.com"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
                        )}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="contactPhone"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Contact Phone
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="tel"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        autoComplete="tel"
                        onChange={(event) => {
                          formatToPhone(event);
                          field.handleChange(event.target.value);
                        }}
                        placeholder="(555) 123 - 4567"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
                        )}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>

          <Separator />

          {/* Section: Property Type */}
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend className="text-lg font-medium">
                Property Type
              </FieldLegend>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="unitType"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Unit Type</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as "single_unit" | "multi_unit"
                          )
                        }
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_unit">
                            Single Unit
                          </SelectItem>
                          <SelectItem value="multi_unit">Multi Unit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Switch to multi-unit to rent individual rooms or units
                        separately.
                      </FieldDescription>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="propertyType"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Property Style
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(value) => field.handleChange(value)}
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
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatLabel(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>

          <Separator />

          {/* Section: Address */}
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend className="text-lg font-medium">Address</FieldLegend>

              <form.Field
                name="addressLine1"
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
                      Address Line 1
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      autoComplete="address-line1"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="123 Main Street"
                      className={cn(
                        controlClassName,
                        field.state.meta.errors.length > 0 &&
                          "border-destructive"
                      )}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <form.Field
                name="addressLine2"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Address Line 2
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      autoComplete="address-line2"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Apt 4B, Suite 100, etc."
                      className={controlClassName}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
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
                        autoComplete="address-level2"
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="New York"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
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
                            ? "text-destructive"
                            : ""
                        }
                      >
                        State
                      </FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as (typeof usStateOptions)[number]
                          )
                        }
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
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {usStateOptions.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                        ZIP / Postal Code
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        autoComplete="postal-code"
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="10001"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
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
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="United States"
                        disabled
                        className={controlClassName}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>

          <Separator />

          {/* Section: Building Details */}
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend className="text-lg font-medium">
                Building Details
              </FieldLegend>

              <div className="grid gap-4 md:grid-cols-3">
                <form.Field
                  name="yearBuilt"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Year Built
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min="1700"
                        max={new Date().getFullYear()}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="2020"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
                        )}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="buildingSqFt"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Building Sq Ft
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min="1"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="2500"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
                        )}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                <form.Field
                  name="lotSqFt"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Lot Sq Ft
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min="1"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="5000"
                        className={cn(
                          controlClassName,
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
                        )}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              </div>
            </FieldSet>
          </FieldGroup>

          <Separator />

          {/* Section: Units */}
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend className="text-lg font-medium">Units</FieldLegend>

              <div className="space-y-6">
                {unitIds.map((unitId, index) => (
                  <FieldSet
                    key={unitId}
                    className="gap-4 relative border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <FieldLegend className="text-base font-medium">
                        Unit {index + 1}
                      </FieldLegend>
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

                    <form.Field
                      name={`units[${index}].unitNumber`}
                      children={(field) => {
                        const currentUnitType = form.getFieldValue("unitType");
                        const isOptional = currentUnitType === "single_unit";
                        return (
                          <Field>
                            <FieldLabel htmlFor={`unit-${index}-number`}>
                              Unit Name{isOptional && " (optional)"}
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
                                controlClassName,
                                field.state.meta.errors.length > 0 &&
                                  "border-destructive"
                              )}
                            />
                            <FieldError errors={field.state.meta.errors} />
                          </Field>
                        );
                      }}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <form.Field
                        name={`units[${index}].bedrooms`}
                        children={(field) => (
                          <Field>
                            <FieldLabel htmlFor={`unit-${index}-bedrooms`}>
                              Bedrooms
                            </FieldLabel>
                            <Select
                              value={field.state.value ?? ""}
                              onValueChange={(value) =>
                                field.handleChange(value)
                              }
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
                      />

                      <form.Field
                        name={`units[${index}].bathrooms`}
                        children={(field) => (
                          <Field>
                            <FieldLabel htmlFor={`unit-${index}-bathrooms`}>
                              Bathrooms
                            </FieldLabel>
                            <Select
                              value={field.state.value ?? ""}
                              onValueChange={(value) =>
                                field.handleChange(value)
                              }
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
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <form.Field
                        name={`units[${index}].rentAmount`}
                        children={(field) => (
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
                      />

                      <form.Field
                        name={`units[${index}].securityDepositAmount`}
                        children={(field) => (
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
                      />
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
            </FieldSet>
          </FieldGroup>

          {/* Form error display */}
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

          {/* Submit buttons */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/owners/properties/details?id=${property.id}`}>
                Cancel
              </Link>
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                  <Save className="size-4" />
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
