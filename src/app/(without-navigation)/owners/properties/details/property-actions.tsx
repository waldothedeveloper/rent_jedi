"use client";

import {
  BadgeCheckIcon,
  MapPin,
  Pencil,
  Send,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { property } from "@/db/schema/properties-schema";
import { useMemo } from "react";

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
          {/* Navigation for small screens */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Settings className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/owners/properties/details/edit?id=${property.id}`}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="#"
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="#"
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="size-4" />
                  Publish
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="#"
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="size-4" />
                  Share
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Navigation for bigger screens */}
          <nav className="hidden md:flex gap-6 text-sm">
            <Link
              href={`/owners/properties/details/edit?id=${property.id}`}
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Pencil className="size-4" />
              Edit
            </Link>
            <Link
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Trash2 className="size-4" />
              Delete
            </Link>
            <Link
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Send className="size-4" />
              Publish
            </Link>
            <Link
              href="#"
              className="hover:text-muted-foreground flex items-center gap-1.5"
            >
              <Share2 className="size-4" />
              Share
            </Link>
          </nav>
        </div>
        <PropertyAddress {...addressData} />
      </div>
    </header>
  );
}
