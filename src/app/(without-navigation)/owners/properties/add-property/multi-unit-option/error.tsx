"use client";

import ErrorComponent from "../error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function MultiUnitError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      description={
        error.message ||
        "We encountered an error while saving your units. Don't worry, your progress is safe."
      }
    />
  );
}
