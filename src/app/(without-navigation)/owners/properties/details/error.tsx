"use client";

import ErrorComponent from "../../../../../components/error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function PropertyDetailsError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      description={
        error.message ||
        "Failed to load property details. The property may not exist or you may not have permission to view it."
      }
    />
  );
}
