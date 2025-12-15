"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudDownload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QRCode from "react-qr-code";
import { authClient } from "@/lib/auth-client";
import { twoFactorSchema } from "@/lib/shared-auth-schema";
import { z } from "zod";

type TwoFactorDialogProps = {
  open: boolean;
  pendingState: boolean | null;
  userEmail?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onOpenChange?: (open: boolean) => void;
};

export function TwoFactorDialog({
  open,
  pendingState,
  userEmail,
  onConfirm,
  onCancel,
  onOpenChange,
}: TwoFactorDialogProps) {
  const enabling = pendingState ?? true;
  const [serverError, setServerError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string;
    backupCodes: string[];
  } | null>(null);

  const enableForm = useForm({
    defaultValues: {
      password: "",
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: twoFactorSchema,
      onDynamic: twoFactorSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null);
      setIsSubmitting(true);

      try {
        if (!enabling) {
          const { error } = await authClient.twoFactor.disable({
            password: value.password,
          });

          if (error) {
            setServerError(
              error.message ?? "Unable to disable two-factor right now."
            );
            return;
          }

          formApi.reset();
          onConfirm();
          return;
        }

        const { data, error } = await authClient.twoFactor.enable({
          password: value.password,
          issuer: "Bloom Rent",
        });

        if (error) {
          setServerError(
            error.message ?? "Unable to enable two-factor right now."
          );
          return;
        }

        if (data) {
          formApi.reset();
          setTwoFactorData({
            totpURI: data.totpURI,
            backupCodes: data.backupCodes ?? [],
          });
          return;
        }

        setServerError("Unable to enable two-factor right now.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const verifyForm = useForm({
    defaultValues: {
      code: "",
      trustDevice: false,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
    validators: {
      onSubmit: z.object({
        code: z
          .string()
          .min(6, "Enter the 6-digit code")
          .max(8, "Code looks too long"),
        trustDevice: z.boolean(),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      setVerifyError(null);
      setIsVerifying(true);

      try {
        const { error } = await authClient.twoFactor.verifyTotp({
          code: value.code,
          trustDevice: value.trustDevice,
        });

        if (error) {
          setVerifyError(
            error.message ?? "Unable to verify the code right now."
          );
          return;
        }

        formApi.reset();
        setTwoFactorData(null);
        onConfirm();
      } finally {
        setIsVerifying(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      setServerError(null);
      setVerifyError(null);
      setTwoFactorData(null);
      enableForm.reset();
      verifyForm.reset();
    }
  }, [open, enableForm, verifyForm]);

  const downloadBackupCodes = () => {
    if (!twoFactorData?.backupCodes?.length) return;
    const intro = userEmail
      ? `These are your Bloom Rent backup codes for account ${userEmail}. Keep them safe!`
      : "These are your Bloom Rent backup codes. Keep them safe!";
    const content = [intro, "", ...twoFactorData.backupCodes].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bloom-rent-backup-codes.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && (isSubmitting || isVerifying)) return;
        onOpenChange?.(nextOpen);
      }}
    >
      <AlertDialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (twoFactorData) {
              verifyForm.handleSubmit();
            } else {
              enableForm.handleSubmit();
            }
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {twoFactorData
                ? "Two-factor authentication enabled"
                : enabling
                  ? "Enable two-factor authentication?"
                  : "Disable two-factor authentication?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {twoFactorData
                ? "Save these details in a safe place. You'll need them if you lose access to your authenticator."
                : enabling
                  ? "Please enter your password to enable this feature. Once enabled you can select different forms of two-factor methods."
                  : "Enter your password to turn off two-factor prompts for this account."}
            </AlertDialogDescription>
            {twoFactorData ? (
              <div className="mt-4 space-y-6">
                <div className="flex flex-col items-center gap-3 rounded border border-input bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">
                    Scan this QR code in your authenticator app of preference
                  </p>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <QRCode value={twoFactorData.totpURI} size={180} />
                  </div>
                  <div className="space-y-3">
                    <verifyForm.Field
                      name="code"
                      children={(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>
                            Enter the 6-digit code
                          </FieldLabel>
                          <Input
                            id={field.name}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            maxLength={8}
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
                    <verifyForm.Field
                      name="trustDevice"
                      children={(field) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={field.name}
                            checked={field.state.value ?? false}
                            onCheckedChange={(checked) =>
                              field.handleChange(Boolean(checked))
                            }
                            onBlur={field.handleBlur}
                          />
                          <Label htmlFor={field.name}>Trust this device</Label>
                        </div>
                      )}
                    />
                    {verifyError && (
                      <p className="text-sm text-destructive">{verifyError}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Backup codes
                  </p>
                  <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {twoFactorData.backupCodes.map((code) => (
                      <li
                        key={code}
                        className="rounded border border-input bg-muted/50 px-2 py-1 font-mono text-xs"
                      >
                        {code}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadBackupCodes}
                    >
                      <CloudDownload className="size-5 text-muted-foreground" />
                      Download backup codes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="logout-password"
                  className="block text-sm/6 font-medium text-muted-foreground dark:text-background"
                >
                  Your account password
                </label>

                <enableForm.Field
                  name="password"
                  children={(field) => (
                    <Field className="mt-6">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        autoComplete="current-password"
                        id={field.name}
                        type="password"
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

                {serverError && (
                  <p className="text-sm text-destructive mt-2">{serverError}</p>
                )}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
            {twoFactorData ? (
              <verifyForm.Subscribe
                selector={(state) => [state.canSubmit, state.isPristine]}
                children={([canSubmit, isPristine]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isVerifying || isPristine}
                  >
                    {isVerifying ? "Verifying..." : "Verify & continue"}
                  </Button>
                )}
              />
            ) : (
              <enableForm.Subscribe
                selector={(state) => [state.canSubmit, state.isPristine]}
                children={([canSubmit, isPristine]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting || isPristine}
                  >
                    {isSubmitting
                      ? enabling
                        ? "Activating..."
                        : "Disabling..."
                      : enabling
                        ? "Activate"
                        : "Disable"}
                  </Button>
                )}
              />
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
