"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TwoFactorDialog } from "./two-factor-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TwoFactorForm({
  isTwoFactorEnabled,
  userEmail,
}: {
  isTwoFactorEnabled: boolean | undefined | null;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTwoFactorState, setPendingTwoFactorState] = useState<
    boolean | null
  >(null);

  const requestTwoFactorChange = (next: boolean) => {
    setPendingTwoFactorState(next);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setPendingTwoFactorState(null);
  };

  const confirmTwoFactorChange = () => {
    if (pendingTwoFactorState === null) return;
    closeDialog();

    router.refresh();
  };

  return (
    <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
      <div>
        <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h2>
        <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
          Add an additional layer of security by requiring at least two methods
          of authentication to sign in.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="md:col-span-2"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
          <div className="flex items-center space-x-2 col-span-full">
            <Switch
              id="two-factor-toggle"
              checked={isTwoFactorEnabled ?? false}
              onCheckedChange={requestTwoFactorChange}
            />
            <Label htmlFor="two-factor-toggle">
              {isTwoFactorEnabled
                ? "Your Two-Factor Authentication is enabled"
                : "Enable Two-Factor Authentication"}
            </Label>
          </div>
        </div>

        <TwoFactorDialog
          open={dialogOpen}
          pendingState={pendingTwoFactorState}
          userEmail={userEmail ?? undefined}
          onConfirm={confirmTwoFactorChange}
          onCancel={closeDialog}
          onOpenChange={(nextOpen) => {
            setDialogOpen(nextOpen);
            if (!nextOpen) {
              setPendingTwoFactorState(null);
            }
          }}
        />
      </form>
    </div>
  );
}
