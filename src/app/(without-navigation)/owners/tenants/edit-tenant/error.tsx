"use client";

import ErrorComponent from "../../../../../components/error-component";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function EditTenantError({ error }: ErrorProps) {
  return (
    <ErrorComponent
      title="Failed to load tenant"
      description={
        error.message ||
        "Failed to load tenant edit form. The tenant may not exist or you may not have permission to edit it."
      }
      startOverHref="/owners/tenants"
      startOverText="Back to Tenants"
    />
  );
}
