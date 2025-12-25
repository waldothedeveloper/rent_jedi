"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { resendVerificationEmailAction } from "@/app/actions/auth";

const initialState = {
  success: false,
  message: "",
};

export const EmailForm = () => {
  const [timeToNextResend, setTimeToNextResend] = useState(30);
  const interval = useRef<NodeJS.Timeout>(undefined);
  const [state, formAction, pending] = useActionState(
    resendVerificationEmailAction,
    initialState
  );

  useEffect(() => {
    startEmailVerificationCountdown();
  }, []);

  function startEmailVerificationCountdown(time = 30) {
    setTimeToNextResend(time);

    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setTimeToNextResend((t) => {
        const newT = t - 1;

        if (newT <= 0) {
          clearInterval(interval.current);
          return 0;
        }
        return newT;
      });
    }, 1000);
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6 items-center justify-center"
    >
      <p>Still can&apos;t find the email?</p>

      <Button
        disabled={pending || timeToNextResend > 0}
        variant="outline"
        type="submit"
      >
        {timeToNextResend > 0
          ? `Resend Verification Email in ${timeToNextResend}s`
          : "Resend Verification Email"}
      </Button>
      <p className={state.success ? "text-chart-2" : "text-destructive"}>
        {state.message}
      </p>
    </form>
  );
};
