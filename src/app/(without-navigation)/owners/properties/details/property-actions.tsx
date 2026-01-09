"use client";

import { useMemo } from "react";
import {
  BadgeCheckIcon,
  MapPin,
  Pencil,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { property } from "@/db/schema/properties-schema";

type PropertyActionsProps = {
  property: typeof property.$inferSelect;
};

type PropertyAddressProps = {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  propertyStatus: string;
  contactEmail: string | null;
  contactPhone: string | null;
};

function PropertyAddress({
  addressLine1,
  addressLine2,
  city,
  state,
  zipCode,
  country,
  propertyStatus,
  contactEmail,
  contactPhone,
}: PropertyAddressProps) {
  return (
    <div className="text-right text-sm">
      <div className="text-muted-foreground">
        <div className="flex md:gap-2 justify-between">
          <MapPin className="size-4 mt-0.5" />
          <div className="md:ml-0 flex flex-col text-right md:text-left">
            <div className="flex flex-col md:flex-row">
              <span>
                {addressLine1} {addressLine2 ?? ""}
                <span className="hidden md:inline">, </span>
              </span>
              <span>
                {city}, {state} {zipCode}
              </span>
            </div>
            <span className="uppercase self-end">{country}</span>
          </div>
        </div>
      </div>
      <Badge
        variant="secondary"
        className="my-2 bg-chart-2 text-background dark:bg-chart-2 uppercase"
      >
        <BadgeCheckIcon />
        {propertyStatus}
      </Badge>
      <div className="font-medium">{contactEmail ?? ""}</div>
      <div className="font-medium">{contactPhone ?? ""}</div>
    </div>
  );
}

export function PropertyActions({ property }: PropertyActionsProps) {
  const addressData = useMemo(
    () => ({
      addressLine1: property.addressLine1,
      addressLine2: property.addressLine2,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      country: property.country,
      propertyStatus: property.propertyStatus,
      contactEmail: property.contactEmail,
      contactPhone: property.contactPhone,
    }),
    [
      property.addressLine1,
      property.addressLine2,
      property.city,
      property.state,
      property.zipCode,
      property.country,
      property.propertyStatus,
      property.contactEmail,
      property.contactPhone,
    ]
  );

  return (
    <header>
      <Separator orientation="horizontal" className="h-5" />
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6 text-sm">
            <a
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Pencil className="size-4" />
              Edit
            </a>
            <a
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Trash2 className="size-4" />
              Delete
            </a>
            <a
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Send className="size-4" />
              Publish
            </a>
            <a
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Share2 className="size-4" />
              Share
            </a>
          </nav>
        </div>
        <PropertyAddress {...addressData} />
      </div>
    </header>
  );
}
