"use client";

import { Button } from "@/components/ui/button";
import { resendVerificationEmailAction } from "../actions/auth";
import { useActionState } from "react";

const initialState = {
  success: false,
  message: "",
};

export const EmailForm = ({ email }: { email: string }) => {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmailAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6 items-center justify-center"
    >
      <p>Still can&apos;t find the email?</p>
      <input type="text" hidden name="email" value={email ?? ""} readOnly />
      <Button disabled={pending} variant="outline" type="submit">
        {pending ? "Resending email..." : "Resend Verification Email"}
      </Button>
      <p className={state.success ? "text-chart-2" : "text-destructive"}>
        {state.message}
      </p>
    </form>
  );
};
