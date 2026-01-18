"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sendTenantInvitation } from "@/app/actions/invites";
import { toast } from "sonner";

interface SendingClientProps {
  tenantId: string;
  unitId: string;
  propertyId: string;
}

export function SendingClient({
  tenantId,
  unitId,
  propertyId,
}: SendingClientProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasSentRef = useRef(false);

  useEffect(() => {
    // Prevent double-sending in React Strict Mode
    if (hasSentRef.current) return;
    hasSentRef.current = true;

    const sendInvite = async () => {
      try {
        const result = await sendTenantInvitation({
          tenantId,
          unitId,
          propertyId,
        });

        if (result.success) {
          toast.success(result.message || "Invitation sent successfully!");
          router.push("/owners/tenants");
        } else {
          setError(result.message || "Failed to send invitation.");
          setIsSending(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        setIsSending(false);
      }
    };

    sendInvite();
  }, [tenantId, unitId, propertyId, router]);

  const handleCancel = () => {
    router.push("/owners/tenants");
  };

  const handleRetry = () => {
    setError(null);
    setIsSending(true);
    hasSentRef.current = false;

    // Trigger re-send
    const sendInvite = async () => {
      try {
        const result = await sendTenantInvitation({
          tenantId,
          unitId,
          propertyId,
        });

        if (result.success) {
          toast.success(result.message || "Invitation sent successfully!");
          router.push("/owners/tenants");
        } else {
          setError(result.message || "Failed to send invitation.");
          setIsSending(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        setIsSending(false);
      }
    };

    sendInvite();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
        <div className="flex w-full max-w-md flex-col gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-destructive">
              Failed to Send Invitation
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Back to Tenants
            </Button>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-md flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <h1 className="text-2xl font-semibold">Sending Invitation</h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we send the invitation email to your tenant...
          </p>
        </div>
        {isSending && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
