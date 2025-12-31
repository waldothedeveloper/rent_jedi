"use client";

import ErrorComponent from "../error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function SingleUnitError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      description={
        error.message ||
        "We encountered an error while saving your unit details. Don't worry, your progress is safe."
      }
    />
  );
}
