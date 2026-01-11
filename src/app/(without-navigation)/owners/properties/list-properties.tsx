"use client";

import {
  Bath,
  Bed,
  EllipsisVertical,
  Grid3x2,
  List,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import defaultHouse from "@/app/images/default-house.png";
import type { property } from "@/db/schema/properties-schema";
import { useState } from "react";

type Property = typeof property.$inferSelect & {
  unitsCount: number;
  bedrooms: number | null;
  bathrooms: number | null;
};

interface ListPropertiesProps {
  properties: Property[];
}

const statusStyles = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  live: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  paused: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  rented:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
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
  type ViewMode = "grid" | "list";
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const handleProperty = (property: Property) => {
    // Draft properties → Route to wizard at correct step
    if (property.propertyStatus === "draft") {
      // No unitType → Step 3 (property type)
      if (!property.unitType) {
        return `/owners/properties/add-property/property-type?propertyId=${property.id}&completedSteps=2`;
      }

      // Has unitType but no units → Step 4 (unit details)
      if (property.unitsCount === 0) {
        const step4Path =
          property.unitType === "single_unit"
            ? "/owners/properties/add-property/single-unit-option"
            : "/owners/properties/add-property/multi-unit-option";
        return `${step4Path}?propertyId=${property.id}&completedSteps=3&unitType=${property.unitType}`;
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
          <Link href="/owners/properties/add-property/property-name-and-description">
            <Button type="button">Create Property</Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-end w-full gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="icon-sm"
          onClick={() => setViewMode("list")}
          aria-label="List view"
        >
          <List className="size-5" />
        </Button>
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="icon-sm"
          onClick={() => setViewMode("grid")}
          aria-label="Grid view"
        >
          <Grid3x2 className="size-5" />
        </Button>
      </div>

      {/* Properties View */}
      {viewMode === "grid" ? (
        <GridView properties={properties} onPropertyClick={handleProperty} />
      ) : (
        <ListView properties={properties} onPropertyClick={handleProperty} />
      )}
    </div>
  );
}

interface GridViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => string;
}

function GridView({ properties, onPropertyClick }: GridViewProps) {
  return (
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
            href={onPropertyClick(property)}
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
                <MapPin className="mt-0.5 size-4 shrink-0" />
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
  );
}

interface ListViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => string;
}

function ListView({ properties, onPropertyClick }: ListViewProps) {
  return (
    <div className="flex flex-col gap-4">
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

        const cardContent = (
          <>
            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg">
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

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="line-clamp-1">{fullAddress}</span>
              </div>

              {property.unitType === "single_unit" &&
              property.bedrooms !== null &&
              property.bathrooms !== null ? (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Bed className="size-4 text-muted-foreground" />
                    <span>
                      {property.bedrooms}{" "}
                      {property.bedrooms === 1 ? "bed" : "beds"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="size-4 text-muted-foreground" />
                    <span>
                      {property.bathrooms % 1 === 0
                        ? property.bathrooms
                        : Number.parseFloat(
                            property.bathrooms.toString()
                          ).toFixed(1)}{" "}
                      {property.bathrooms === 1 ? "bath" : "baths"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {property.unitsCount}{" "}
                  {property.unitsCount === 1 ? "unit" : "units"}
                </div>
              )}
              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link href={onPropertyClick(property)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    View Property
                  </Button>
                </Link>
                <PropertyActionsDropdown
                  property={property}
                  onPropertyClick={onPropertyClick}
                />
              </div>
            </div>
          </>
        );
        return (
          <div
            key={property.id}
            className="flex md:flex-col flex-row items-start sm:items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
          >
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}

interface PropertyActionsDropdownProps {
  property: Property;
  onPropertyClick: (property: Property) => string;
}

function PropertyActionsDropdown({
  property,
  onPropertyClick,
}: PropertyActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <EllipsisVertical className="size-4" />
          <span className="sr-only">Property actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={onPropertyClick(property)}
            className="cursor-pointer block md:hidden"
          >
            View Property
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="block md:hidden" />
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Move</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
