"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { NormalizedAddress, Verdict } from "@/types/google-maps";
import { useState } from "react";

interface AddressSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userAddress: NormalizedAddress;
  googleAddress: NormalizedAddress;
  verdict?: Verdict;
  validationMessage?: string;
  onConfirm: (selectedAddress: NormalizedAddress) => void;
  isLoading?: boolean;
}

export function AddressSelectionDialog({
  open,
  onOpenChange,
  userAddress,
  googleAddress,
  verdict,
  validationMessage,
  onConfirm,
  isLoading = false,
}: AddressSelectionDialogProps) {
  const [selectedAddress, setSelectedAddress] = useState<"user" | "google">(
    "google"
  );

  const handleConfirm = () => {
    const address = selectedAddress === "user" ? userAddress : googleAddress;
    onConfirm(address);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Address</AlertDialogTitle>
          <AlertDialogDescription>
            We found a suggested address. Please select which version you'd like
            to use.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {validationMessage && (
          <div className="rounded-md bg-muted p-3 mb-4">
            <p className="text-sm text-muted-foreground">{validationMessage}</p>
          </div>
        )}

        <RadioGroup
          value={selectedAddress}
          onValueChange={(value) =>
            setSelectedAddress(value as "user" | "google")
          }
          className="gap-4"
        >
          {/* User's Entered Address */}
          <Label
            htmlFor="user-address"
            // className={`cursor-pointer transition-all rounded-lg ${
            //   selectedAddress === "user"
            //     ? "ring-2 ring-primary ring-offset-2"
            //     : "hover:ring-1 hover:ring-border"
            // }`}
          >
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="user" id="user-address" />
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      What you entered
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-9">
                <AddressDisplay address={userAddress} />
              </CardContent>
            </Card>
          </Label>

          {/* Google's Suggested Address */}
          <Label
            htmlFor="google-address"
            // className={`cursor-pointer transition-all rounded-lg ${
            //   selectedAddress === "google"
            //     ? "ring-2 ring-primary ring-offset-2"
            //     : "hover:ring-1 hover:ring-border"
            // }`}
          >
            <Card className="w-full">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="google" id="google-address" />
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      Recomended Address{" "}
                      <span className="text-xs text-muted-foreground font-normal flex items-center">
                        (verified by Google)
                        <Check className="ml-1 size-4 text-green-600" />
                      </span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-9">
                <AddressDisplay address={googleAddress} />
              </CardContent>
            </Card>
          </Label>
        </RadioGroup>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel and Edit Address
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Saving..." : "Confirm and Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper component to display address consistently
function AddressDisplay({ address }: { address: NormalizedAddress }) {
  return (
    <div className="text-sm space-y-1">
      <p>{address.addressLine1}</p>
      {address.addressLine2 && <p>{address.addressLine2}</p>}
      <p>
        {address.city}, {address.state} {address.zipCode}
      </p>
      <p className="text-muted-foreground">{address.country}</p>
    </div>
  );
}
