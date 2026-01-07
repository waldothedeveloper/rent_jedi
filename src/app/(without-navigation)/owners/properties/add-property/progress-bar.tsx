"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

type StepStatus = "complete" | "current" | "upcoming";

interface Step {
  id: string;
  name: string;
  href: string;
  status: StepStatus;
}

export default function AddPropertyProgressBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const propertyId = searchParams.get("propertyId");

  // Determine current step from pathname
  let currentStep = 1;
  if (pathname.includes("/property-name-and-description")) currentStep = 1;
  if (pathname.includes("/address")) currentStep = 2;
  if (pathname.includes("/property-type")) currentStep = 3;
  if (
    pathname.includes("/single-unit-option") ||
    pathname.includes("/multi-unit-option")
  ) {
    currentStep = 4;
  }

  // Read progress state from URL instead of fetching from server
  const urlCompletedSteps = parseInt(
    searchParams.get("completedSteps") || "0",
    10
  );
  const unitType = searchParams.get("unitType");

  // Ensure completedSteps is at least (currentStep - 1) to prevent invalid states
  // E.g., if on step 3, at least steps 1-2 should be complete
  const minCompletedSteps = currentStep - 1;
  const completedSteps = Math.max(urlCompletedSteps, minCompletedSteps);

  const steps: Step[] = [
    {
      id: "Step 1",
      name: "Property Name",
      href: propertyId
        ? `/owners/properties/add-property/property-name-and-description?propertyId=${propertyId}&completedSteps=${completedSteps}${unitType ? `&unitType=${unitType}` : ""}`
        : "/owners/properties/add-property/property-name-and-description",
      status:
        currentStep === 1
          ? "current"
          : completedSteps >= 1
            ? "complete"
            : "upcoming",
    },
    {
      id: "Step 2",
      name: "Property Address",
      href: propertyId
        ? `/owners/properties/add-property/address?propertyId=${propertyId}&completedSteps=${completedSteps}${unitType ? `&unitType=${unitType}` : ""}`
        : "#",
      status:
        currentStep === 2
          ? "current"
          : completedSteps >= 2
            ? "complete"
            : "upcoming",
    },
    {
      id: "Step 3",
      name: "Property Type",
      href: propertyId
        ? `/owners/properties/add-property/property-type?propertyId=${propertyId}&completedSteps=${completedSteps}${unitType ? `&unitType=${unitType}` : ""}`
        : "#",
      status:
        currentStep === 3
          ? "current"
          : completedSteps >= 3
            ? "complete"
            : "upcoming",
    },
    {
      id: "Step 4",
      name: "Unit Details",
      href:
        propertyId && unitType
          ? unitType === "single_unit"
            ? `/owners/properties/add-property/single-unit-option?propertyId=${propertyId}&completedSteps=${completedSteps}&unitType=${unitType}`
            : `/owners/properties/add-property/multi-unit-option?propertyId=${propertyId}&completedSteps=${completedSteps}&unitType=${unitType}`
          : "#",
      status:
        currentStep === 4
          ? "current"
          : completedSteps >= 4
            ? "complete"
            : "upcoming",
    },
  ];

  return (
    <>
      {/* small screens */}
      <nav
        aria-label="Progress"
        className="flex items-center justify-center md:hidden"
      >
        <p className="text-sm font-medium text-muted-foreground">
          Step {steps.findIndex((step) => step.status === "current") + 1} of{" "}
          {steps.length}
        </p>
        <ol role="list" className="ml-8 flex items-center space-x-5">
          {steps.map((step) => (
            <li key={step.name}>
              {step.status === "complete" ? (
                <Link
                  href={step.href}
                  className="block size-2.5 rounded-full bg-primary hover:bg-primary/90"
                >
                  <span className="sr-only">{step.name}</span>
                </Link>
              ) : step.status === "current" ? (
                <Link
                  href={step.href}
                  aria-current="step"
                  className="relative flex items-center justify-center"
                >
                  <span
                    aria-hidden="true"
                    className="absolute flex size-5 p-px"
                  >
                    <span className="size-full rounded-full bg-primary/10" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative block size-2.5 rounded-full bg-primary"
                  />
                  <span className="sr-only">{step.name}</span>
                </Link>
              ) : (
                <Link
                  href={step.href}
                  className="block size-2.5 rounded-full bg-muted hover:bg-muted-foreground/40"
                >
                  <span className="sr-only">{step.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {/* Desktop Navigation and medium screens */}
      <nav aria-label="Progress" className="hidden md:block">
        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step) => (
            <li key={step.name} className="md:flex-1">
              {step.status === "complete" ? (
                <Link
                  href={step.href}
                  className="group flex flex-col border-l-4 border-primary py-2 pl-4 hover:border-primary md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0"
                >
                  <span className="text-sm font-medium text-primary">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {step.name}
                  </span>
                </Link>
              ) : step.status === "current" ? (
                <Link
                  href={step.href}
                  aria-current="step"
                  className="flex flex-col border-l-4 border-primary py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0"
                >
                  <span className="text-sm font-medium text-primary">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {step.name}
                  </span>
                </Link>
              ) : (
                <Link
                  href={step.href}
                  className="group flex flex-col border-l-4 border-border py-2 pl-4 hover:border-primary md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0"
                >
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {step.name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
