"use client";

import ErrorComponent from "../../../../../../components/error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function PropertyTypeError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      description={
        error.message ||
        "We encountered an error while saving your property type. Don't worry, your progress is safe."
      }
    />
  );
}
