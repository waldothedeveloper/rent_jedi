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
  PropertyType,
  controlClassName,
  disallowNonNumericInput,
  formatLabel,
  formatToPhone,
  propertyFormSchema,
  propertyTypeOptions,
  unitTypeOptions,
  usStateOptions,
} from "./form-helpers";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createProperty, type CreatePropertyInput } from "@/app/actions/properties";
import { toast } from "sonner";

export function CreatePropertyForm({
  className,
  onSubmitted,
  ...props
}: React.ComponentProps<"div"> & { onSubmitted?: () => void }) {
  const defaultValues = {
    name: "",
    description: "",
    unitType: "",
    propertyType: "",
    contactEmail: "",
    contactPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    yearBuilt: "",
    buildingSqFt: "",
    lotSqFt: "",
  };

  const form = useForm({
    defaultValues,
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: propertyFormSchema,
      onDynamic: propertyFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      // Type assertion is safe here because TanStack Form validates with the schema before calling onSubmit
      const response = await createProperty(value as unknown as CreatePropertyInput);

      if (!response.success) {
        toast.error(response.message || "Failed to create property");
        return;
      }

      toast.success("Property created successfully!");
      formApi.reset();
      onSubmitted?.();
    },
  });

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
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
            <FieldLegend>Property basics</FieldLegend>
            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="name"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Property name</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g. Lakeside Haven"
                    />
                    <FieldDescription>
                      Think of this like a nickname that will help you recognize
                      your property.
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <form.Field
                name="propertyType"
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
                      Property type
                    </FieldLabel>
                    <select
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value as PropertyType)
                      }
                      className={cn(
                        controlClassName,
                        "h-9",
                        field.state.meta.errors.length > 0
                          ? "border-destructive text-destructive"
                          : ""
                      )}
                    >
                      <option value="" disabled>
                        Select a property type
                      </option>
                      {propertyTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {formatLabel(option)}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={field.state.meta.errors} />
                    <FieldDescription>
                      Choose the closest match so renters know what to expect.
                    </FieldDescription>
                  </Field>
                )}
              />
            </div>
            <form.Field
              name="description"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <textarea
                    id={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    className={cn(controlClassName, "min-h-28 resize-y")}
                    placeholder="Highlight amenities, recent upgrades, or nearby landmarks."
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
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
                    Unit Quantity
                  </FieldLabel>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
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

          <FieldSet className="gap-4">
            <FieldLegend>Contact</FieldLegend>
            <FieldDescription>
              How should prospective renters reach you about this property?
            </FieldDescription>
            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="contactEmail"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Contact email</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="owner@example.com"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
              <form.Field
                name="contactPhone"
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
                      Contact phone
                    </FieldLabel>
                    <Input
                      className={
                        field.state.meta.errors.length > 0
                          ? "border-destructive text-destructive"
                          : ""
                      }
                      id={field.name}
                      type="tel"
                      maxLength={16}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onKeyDown={disallowNonNumericInput}
                      onChange={(event) => {
                        formatToPhone(event);
                        field.handleChange(event.target.value);
                      }}
                      placeholder="(555) 123 - 4567"
                    />
                    <FieldError errors={field.state.meta.errors} />
                    <FieldDescription>
                      We'll convert this to E.164 before saving.
                    </FieldDescription>
                  </Field>
                )}
              />
            </div>
          </FieldSet>

          <FieldSet className="gap-4">
            <FieldLegend>Location</FieldLegend>
            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="addressLine1"
                children={(field) => (
                  <Field className="md:col-span-2">
                    <FieldLabel htmlFor={field.name}>Street address</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="123 Main St"
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
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
              <form.Field
                name="city"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>City</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
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
                    <FieldLabel htmlFor={field.name}>
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
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            </div>
          </FieldSet>

          <FieldSet className="gap-4">
            <FieldLegend>Property details</FieldLegend>
            <div className="grid gap-4 md:grid-cols-3">
              <form.Field
                name="yearBuilt"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Year built</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="1998"
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
                      Building sq. ft.
                    </FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="2400"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
              <form.Field
                name="lotSqFt"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Lot sq. ft.</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="5200"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            </div>
          </FieldSet>

          <Field>
            <FieldDescription>
              You can add more details, photos, pricing, and availability after
              creating the property.
            </FieldDescription>
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
                  className="flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Saving draft..." : "Create property"}
                  <ArrowUpRight className="size-4 text-muted" />
                </Button>
              )}
            />
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
