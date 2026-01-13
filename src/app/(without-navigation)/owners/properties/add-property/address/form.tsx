"use client";

import {
  createPropertyDraft,
  updatePropertyDraft,
} from "@/app/actions/properties";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import type {
  AddressValidationSuccess,
  NormalizedAddress,
} from "@/types/google-maps";
import {
  addressFormSchema,
  controlClassName,
  propertyTypeOptions,
  usStateOptions,
  type PropertyType,
} from "@/utils/form-helpers";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";

import { validateAddress } from "@/app/actions/address-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { property } from "@/db/schema/properties-schema";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { AddressSelectionDialog } from "./address-selection-dialog";

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
  const [formError, setFormError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationResult, setValidationResult] =
    useState<AddressValidationSuccess | null>(null);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [nameFromStorage, setNameFromStorage] = useState<string>("");
  const [descriptionFromStorage, setDescriptionFromStorage] =
    useState<string>("");
  const [propertyTypeFromStorage, setPropertyTypeFromStorage] = useState<
    PropertyType | undefined
  >(undefined);

  // Read name and description from localStorage on mount
  useEffect(() => {
    const name = localStorage.getItem("draft-property-name") || "";
    const description =
      localStorage.getItem("draft-property-description") || "";
    const propertyType = localStorage.getItem("draft-property-type");
    const parsedPropertyType = propertyTypeOptions.includes(
      propertyType as PropertyType
    )
      ? (propertyType as PropertyType)
      : undefined;
    setNameFromStorage(name);
    setDescriptionFromStorage(description);
    setPropertyTypeFromStorage(parsedPropertyType);
  }, []);

  const defaultValues = {
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    country: initialData?.country || "United States",
  };

  const saveAddressToDB = async (address: NormalizedAddress) => {
    const normalizedAddress = {
      ...address,
      addressLine2: address.addressLine2 ?? "",
    };

    if (isEditMode && propertyId) {
      const result = await updatePropertyDraft({
        propertyId,
        ...normalizedAddress,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to update address");
      }

      toast.success("Address updated!");
      router.push(
        `/owners/properties/add-property/property-type?propertyId=${propertyId}&completedSteps=2`
      );
    } else {
      // Create new draft with address + name/description from localStorage
      const addressPayload = normalizedAddress as z.infer<
        typeof addressFormSchema
      >;
      const result = await createPropertyDraft({
        ...addressPayload,
        name: nameFromStorage,
        description: descriptionFromStorage || undefined,
        propertyType: propertyTypeFromStorage,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to save address");
      }

      // Clear localStorage after successful draft creation
      localStorage.removeItem("draft-property-name");
      localStorage.removeItem("draft-property-description");
      localStorage.removeItem("draft-property-type");

      toast.success("Address saved! Moving to next step...");
      router.push(
        `/owners/properties/add-property/property-type?propertyId=${result.propertyId}&completedSteps=2`
      );
    }
  };

  // Handler for dialog confirmation
  const handleAddressConfirm = async (selectedAddress: NormalizedAddress) => {
    setIsSavingToDB(true);
    try {
      await saveAddressToDB(selectedAddress);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save address";
      setFormError(errorMsg);
      toast.error(errorMsg);
      setDialogOpen(false);
    } finally {
      setIsSavingToDB(false);
    }
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
      setFormError(null);

      try {
        const validationResult = await validateAddress(
          value as z.infer<typeof addressFormSchema>
        );

        if (!validationResult.success) {
          const errorMsg =
            validationResult.message || "Failed to validate address";
          setFormError(errorMsg);
          toast.error(errorMsg);
          return;
        }

        // Handle based on Google's recommendation
        if (validationResult.verdict.possibleNextAction === "FIX") {
          // Show error - address has significant issues
          setFormError(
            validationResult.validationMessage || "Please fix the address"
          );
          toast.error(
            "This address cannot be validated. Please check for errors."
          );
          return;
        }

        // For CONFIRM, CONFIRM_ADD_SUBPREMISES, ACCEPT, or missing verdict - show dialog
        setValidationResult(validationResult);
        setDialogOpen(true);
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

            {formError && (
              <div
                role="alert"
                className="rounded-md border border-destructive bg-destructive/10 p-4"
              >
                <p className="text-sm font-semibold text-destructive mb-1">
                  Unable to save address
                </p>
                <p className="text-sm text-destructive">{formError}</p>
              </div>
            )}

            <Field>
              <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(
                      propertyId
                        ? `/owners/properties/add-property/property-name-and-description?propertyId=${propertyId}`
                        : "/owners/properties/add-property/property-name-and-description"
                    )
                  }
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
                        ? "Validating address..."
                        : isEditMode
                          ? "Update & Continue"
                          : "Continue to Property Type"}
                      <ArrowRight className="size-4 text-muted" />
                    </Button>
                  )}
                />
              </div>
            </Field>
          </FieldGroup>
        </form>

        {/* Address Selection Dialog */}
        {validationResult && (
          <AddressSelectionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            userAddress={validationResult.userAddress}
            googleAddress={validationResult.googleAddress}
            verdict={validationResult.verdict}
            validationMessage={validationResult.validationMessage}
            onConfirm={handleAddressConfirm}
            isLoading={isSavingToDB}
          />
        )}
      </div>
    </div>
  );
}
