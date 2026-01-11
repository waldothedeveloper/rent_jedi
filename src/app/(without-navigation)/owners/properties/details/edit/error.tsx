"use client";

import ErrorComponent from "../../add-property/error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function EditPropertyError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      description={
        error.message ||
        "Failed to load property edit form. The property may not exist or you may not have permission to edit it."
      }
    />
  );
}
