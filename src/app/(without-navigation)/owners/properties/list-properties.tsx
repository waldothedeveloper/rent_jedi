import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import defaultHouse from "@/app/images/default-house.png";
import type { property } from "@/db/schema/properties-schema";

type Property = typeof property.$inferSelect & {
  unitsCount: number;
};

interface ListPropertiesProps {
  properties: Property[];
}

const statusStyles = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  coming_soon: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  archived:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
} as const;

const formatPropertyStatus = (status: string) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatUnitType = (unitType: string) => {
  return unitType === "single_unit"
    ? "Single-unit property"
    : "Multi-unit property";
};

const formatPropertyType = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function ListProperties({ properties }: ListPropertiesProps) {
  const handleProperty = (property: Property) => {
    // Draft properties → Route to wizard at correct step
    if (property.propertyStatus === "draft") {
      // No unitType → Step 2 (property type)
      if (!property.unitType) {
        return `/owners/properties/add-property/property-type?propertyId=${property.id}&completedSteps=1`;
      }

      // Has unitType but no units → Step 3 (unit details)
      if (property.unitsCount === 0) {
        const step3Path =
          property.unitType === "single_unit"
            ? "/owners/properties/add-property/single-unit-option"
            : "/owners/properties/add-property/multi-unit-option";
        return `${step3Path}?propertyId=${property.id}&completedSteps=2&unitType=${property.unitType}`;
      }
    }

    // Active property → Route to details page
    return `/owners/properties/details?id=${property.id}`;
  };

  return (
    <div className="w-full space-y-6 px-6">
      {/* Section Header */}
      <div className="border-b border-border pb-5 sm:flex sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Your Properties
        </h3>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link href="/owners/properties/add-property/address">
            <Button type="button">Create Property</Button>
          </Link>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const fullAddress = [
            property.addressLine1,
            property.addressLine2,
            property.city,
            property.state,
            property.zipCode,
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              href={handleProperty(property)}
              key={property.id}
              className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
            >
              {/* Default Image Placeholder */}
              <div className="relative aspect-video w-full overflow-hidden">
                <div className="flex h-full items-center justify-center">
                  <Image
                    src={defaultHouse}
                    alt="default house"
                    className="size-full object-contain"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-3 p-4">
                {/* Name and Status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 font-semibold leading-none tracking-tight">
                    {property.name || "Untitled Property"}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={
                      statusStyles[
                        property.propertyStatus as keyof typeof statusStyles
                      ]
                    }
                  >
                    {formatPropertyStatus(property.propertyStatus)}
                  </Badge>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="line-clamp-2">{fullAddress}</p>
                </div>

                {/* Property Type & Unit Type */}
                <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                  <strong>
                    {formatPropertyType(property.propertyType ?? "")}
                  </strong>
                  <span>•</span>
                  <span>{formatUnitType(property.unitType ?? "")}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
