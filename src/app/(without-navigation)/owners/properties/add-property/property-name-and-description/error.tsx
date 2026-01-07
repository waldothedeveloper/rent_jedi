"use client";

import ErrorComponent from "../error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function PropertyNameAndDescriptionError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      description={
        error.message ||
        "We encountered an error while loading the property name form. Please try again."
      }
    />
  );
}
