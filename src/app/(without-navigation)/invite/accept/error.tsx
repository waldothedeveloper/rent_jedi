"use client";

import ErrorComponent from "@/app/(without-navigation)/owners/properties/add-property/error-component";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <ErrorComponent
      title="Failed to Load Invitation"
      description="We encountered an error while trying to load your invitation. This could be due to a network issue or an invalid invitation link."
      errorLabel="Invitation Error"
      startOverHref="/"
      startOverText="Go to Home"
      contactSupportHref="/contact-support"
      contactSupportText="Contact Support"
    />
  );
}
