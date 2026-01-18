"use client";

import { ArrowRight, Clock, Send } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { activateTenantDraft } from "@/app/actions/tenants";
import { createPendingInvite } from "@/app/actions/invites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";

const invitationSchema = z.object({
  invitationChoice: z.enum(["now", "later"]),
});

export default function InvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const propertyId = searchParams.get("propertyId");
  const unitId = searchParams.get("unitId");
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      invitationChoice: "" as "now" | "later" | "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: {
      onSubmit: invitationSchema,
      onChange: invitationSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      if (!tenantId || !propertyId || !unitId) {
        setFormError("Missing required data. Please start over from Step 1.");
        toast.error("Missing required data. Please start over from Step 1.");
        return;
      }

      try {
        // Activate tenant draft with unit assignment
        const result = await activateTenantDraft(tenantId, {
          propertyId,
          unitId,
        });

        if (!result.success) {
          setFormError(result.message || "Failed to create tenant");
          toast.error(result.message || "Failed to create tenant");
          return;
        }

        // Handle invitation based on user choice
        if (value.invitationChoice === "now") {
          // Redirect to sending page to send invitation email
          router.push(
            `/owners/tenants/add-tenant/sending-invitation?tenantId=${tenantId}&unitId=${unitId}&propertyId=${propertyId}`
          );
        } else {
          // "Send Later" - create pending invite without sending email
          const inviteResult = await createPendingInvite({
            tenantId,
            propertyId,
          });

          if (!inviteResult.success) {
            // Tenant was created but invite failed - still redirect with warning
            toast.warning(
              "Tenant created, but invitation could not be saved. You can create it later."
            );
          } else {
            toast.success(
              "Tenant created! You can send the invitation later from their profile."
            );
          }

          router.push("/owners/tenants");
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to create tenant";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Invite Tenant</h1>
          <p className="text-sm text-muted-foreground">
            Choose when to send the invitation to your tenant.
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
            <form.Field
              name="invitationChoice"
              children={(field) => (
                <Field>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "now" | "later")
                    }
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <label htmlFor="send-now" className="cursor-pointer">
                      <Card
                        className={cn(
                          "transition-colors hover:border-primary h-full",
                          field.state.value === "now" &&
                            "border-primary bg-primary/5"
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Send className="size-4 text-primary" />
                                <CardTitle className="text-base">
                                  Send Now
                                </CardTitle>
                              </div>
                              <CardDescription>
                                Send the invitation immediately after creating
                                the tenant.
                              </CardDescription>
                            </div>
                            <RadioGroupItem value="now" id="send-now" />
                          </div>
                        </CardHeader>
                      </Card>
                    </label>

                    <label htmlFor="send-later" className="cursor-pointer">
                      <Card
                        className={cn(
                          "transition-colors hover:border-primary h-full",
                          field.state.value === "later" &&
                            "border-primary bg-primary/5"
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Clock className="size-4 text-muted-foreground" />
                                <CardTitle className="text-base">
                                  Send Later
                                </CardTitle>
                              </div>
                              <CardDescription>
                                Save and send the invitation at a later time.
                              </CardDescription>
                            </div>
                            <RadioGroupItem value="later" id="send-later" />
                          </div>
                        </CardHeader>
                      </Card>
                    </label>
                  </RadioGroup>
                </Field>
              )}
            />

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
                    href={`/owners/tenants/add-tenant/unit-selection?tenantId=${tenantId}&completedSteps=2`}
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
