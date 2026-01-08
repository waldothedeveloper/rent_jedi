import Link from "next/link";

interface ErrorComponentProps {
  title?: string;
  description: string;
  errorLabel?: string;
  startOverHref?: string;
  startOverText?: string;
  contactSupportHref?: string;
  contactSupportText?: string;
}

export default function ErrorComponent({
  title = "Something went wrong",
  description,
  errorLabel = "Error",
  startOverHref = "/owners/properties/add-property/property-name-and-description",
  startOverText = "Start Over",
  contactSupportHref = "/contact-support",
  contactSupportText = "Contact Support",
}: ErrorComponentProps) {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-destructive">{errorLabel}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-destructive">
          {title}
        </h1>
        <p className="mt-6 text-sm font-medium text-pretty text-muted-foreground">
          {description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={startOverHref}
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {startOverText}
          </Link>
          <Link
            href={contactSupportHref}
            className="text-sm font-semibold text-foreground"
          >
            {contactSupportText} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
