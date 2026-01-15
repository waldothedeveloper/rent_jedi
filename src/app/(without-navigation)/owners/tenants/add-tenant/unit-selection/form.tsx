"use client";

import { ArrowRight, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { activateTenantDraft } from "@/app/actions/tenants";
import { cn } from "@/lib/utils";
import { getAvailableUnitsByProperty } from "@/app/actions/properties";
import { toast } from "sonner";
import { unitSelectionSchema } from "@/utils/shared-schemas";

interface Property {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  availableUnits: number;
  totalUnits: number;
}

interface Unit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: string;
  rentAmount: string;
  securityDepositAmount: string | null;
}

interface UnitSelectionFormProps {
  properties: Property[];
}

export default function UnitSelectionForm({
  properties,
}: UnitSelectionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const lastFetchedPropertyId = useRef<string | null>(null);

  const form = useForm({
    defaultValues: {
      propertyId: "",
      unitId: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: unitSelectionSchema,
      onDynamic: unitSelectionSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      if (!tenantId) {
        setFormError("Missing tenant ID. Please start over from Step 1.");
        toast.error("Missing tenant ID. Please start over from Step 1.");
        return;
      }

      try {
        // Activate tenant draft with unit assignment
        const result = await activateTenantDraft(tenantId, {
          propertyId: value.propertyId,
          unitId: value.unitId,
        });

        if (!result.success) {
          setFormError(result.message || "Failed to create tenant");
          toast.error(result.message || "Failed to create tenant");
          return;
        }

        toast.success("Tenant created successfully!");
        router.push("/owners/tenants");
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to create tenant";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  // Handle property selection and fetch units
  const handlePropertyChange = async (propertyId: string) => {
    // Reset unit selection immediately
    form.setFieldValue("unitId", "");

    if (!propertyId) {
      setAvailableUnits([]);
      setSelectedProperty(null);
      lastFetchedPropertyId.current = null;
      return;
    }

    // Only fetch if this is a different property than last time
    if (lastFetchedPropertyId.current === propertyId) {
      return;
    }

    // Update selected property from the properties list
    const property = properties.find((p) => p.id === propertyId);
    setSelectedProperty(property || null);
    lastFetchedPropertyId.current = propertyId;

    // Fetch available units using server action
    setIsLoadingUnits(true);
    try {
      const result = await getAvailableUnitsByProperty(propertyId);

      if (result.success) {
        setAvailableUnits(result.units);
      } else {
        toast.error(result.message || "Failed to load units");
        setAvailableUnits([]);
      }
    } catch (error) {
      toast.error("Failed to load units");
      setAvailableUnits([]);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  // Check if owner has any properties
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">No Properties Found</h1>
            <p className="text-sm text-muted-foreground">
              You need to create a property with units before adding tenants.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/owners/tenants">Cancel</Link>
            </Button>
            <Button asChild>
              <Link href="/owners/properties/add-property">
                Create Property
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasAvailableUnits = properties.some((p) => p.availableUnits > 0);
  if (!hasAvailableUnits) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">No Available Units</h1>
            <p className="text-sm text-muted-foreground">
              All your units currently have active tenants. <br /> Here's what
              you can do to resolve this issue:
            </p>

            <ul className="mb-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground text-sm">
              <li>Create a new property</li>
              <li>
                End Lease for an existing tenant in one of your properties
              </li>
            </ul>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/owners/tenants">Go Back</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Unit Selection</h1>
          <p className="text-sm text-muted-foreground">
            Select the property and unit for this tenant.
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
              {/* Property Select */}
              <form.Field
                name="propertyId"
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
                      Property <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldDescription>
                      Choose a property with available units.
                    </FieldDescription>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value);
                        handlePropertyChange(value);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          field.state.meta.errors.length > 0 &&
                            "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties
                          .filter((p) => p.availableUnits > 0)
                          .map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name} - {property.availableUnits}{" "}
                              {property.availableUnits > 1 ? "units" : "unit"}
                              {` `}available
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              {/* Unit Selection (Radio Cards) */}
              {selectedProperty && (
                <form.Field
                  name="unitId"
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
                        Unit <span className="text-destructive">*</span>
                      </FieldLabel>
                      <FieldDescription>
                        Select an available unit from this property.
                      </FieldDescription>

                      {isLoadingUnits ? (
                        <div className="text-sm text-muted-foreground">
                          Loading units...
                        </div>
                      ) : availableUnits.length === 0 ? (
                        <div className="text-sm text-destructive">
                          No available units in this property.
                        </div>
                      ) : (
                        <RadioGroup
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                          className="grid gap-4 sm:grid-cols-2"
                        >
                          {availableUnits.map((unit) => (
                            <label
                              key={unit.id}
                              htmlFor={unit.id}
                              className="cursor-pointer"
                            >
                              <Card
                                className={cn(
                                  "transition-colors hover:border-primary",
                                  field.state.value === unit.id &&
                                    "border-primary bg-primary/5"
                                )}
                              >
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <CardTitle className="text-base">
                                        Unit {unit.unitNumber}
                                      </CardTitle>
                                      <CardDescription>
                                        {unit.bedrooms} bed · {unit.bathrooms}{" "}
                                        bath
                                      </CardDescription>
                                    </div>
                                    <RadioGroupItem
                                      value={unit.id}
                                      id={unit.id}
                                    />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">
                                        Rent:
                                      </span>
                                      <span className="flex items-center font-semibold">
                                        <DollarSign className="size-3" />
                                        {unit.rentAmount}
                                      </span>
                                    </div>
                                    {unit.securityDepositAmount && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Deposit:
                                        </span>
                                        <span className="flex items-center">
                                          <DollarSign className="size-3" />
                                          {unit.securityDepositAmount}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </label>
                          ))}
                        </RadioGroup>
                      )}
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />
              )}
            </FieldSet>

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-destructive/10 p-4"
              >
                <p className="text-sm font-semibold text-destructive mb-1">
                  Unable to create tenant
                </p>
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <Field>
              <div className="flex items-center justify-between gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link
                    href={`/owners/tenants/add-tenant/lease-dates?tenantId=${tenantId}&completedSteps=2`}
                  >
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
                      {isSubmitting ? "Creating Tenant..." : "Create Tenant"}
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
