"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bath,
  Bed,
  Building2,
  DollarSign,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Trash2,
} from "lucide-react";
import { property } from "@/db/schema/properties-schema";
import { unit } from "@/db/schema/units-schema";

type PropertyWithUnits = typeof property.$inferSelect & {
  units: (typeof unit.$inferSelect)[];
};

interface PropertyDetailsProps {
  property: PropertyWithUnits;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartment",
  single_family_home: "Single Family Home",
  condo: "Condo",
  townhouse: "Townhouse",
  other: "Other",
};

const statusColors = {
  draft: "bg-gray-500",
  active: "bg-green-500",
  coming_soon: "bg-blue-500",
  archived: "bg-red-500",
};

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const isMultiUnit = property.unitType === "multi_unit";
  const singleUnit = property.units[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="py-8 border-b">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{property.name}</h1>
                <Badge
                  className={`${
                    statusColors[property.propertyStatus]
                  } text-white`}
                >
                  {property.propertyStatus}
                </Badge>
              </div>

              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="size-4 mr-1 shrink-0" />
                <span className="text-base">
                  {property.addressLine1}
                  {property.addressLine2 &&
                    `, ${property.addressLine2}`}
                  , {property.city}, {property.state}{" "}
                  {property.zipCode}
                </span>
              </div>

              {/* Key Stats */}
              <div className="flex flex-wrap items-center gap-6 text-lg">
                {!isMultiUnit ? (
                  <>
                    <div className="flex items-center gap-2 font-semibold">
                      <DollarSign className="size-5" />
                      <span>
                        {parseFloat(
                          singleUnit.rentAmount
                        ).toLocaleString()}
                        <span className="text-sm text-muted-foreground font-normal ml-1">
                          /mo
                        </span>
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <Bed className="size-5 text-muted-foreground" />
                      <span>{singleUnit.bedrooms} beds</span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <Bath className="size-5 text-muted-foreground" />
                      <span>{singleUnit.bathrooms} baths</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 font-semibold">
                      <Building2 className="size-5" />
                      <span>{property.units.length} units</span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-5 text-muted-foreground" />
                      <span>
                        $
                        {Math.round(
                          property.units.reduce(
                            (acc, unit) => acc + parseFloat(unit.rentAmount),
                            0
                          ) / property.units.length
                        ).toLocaleString()}
                        <span className="text-sm text-muted-foreground ml-1">
                          avg/mo
                        </span>
                      </span>
                    </div>
                  </>
                )}
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Ruler className="size-5 text-muted-foreground" />
                  <span>
                    {property.buildingSqFt?.toLocaleString()} sq ft
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg">
                <Edit className="size-4 mr-2" />
                Edit Property
              </Button>
              <Button size="lg" variant="outline">
                <FileText className="size-4 mr-2" />
                Create Listing
              </Button>
              <Button size="lg" variant="destructive">
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery - TODO: Add image upload functionality */}
            {/* <section className="border rounded-lg p-6 bg-card">
              <div className="relative">
                <div className="aspect-[21/9] overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              </div>
            </section> */}

            {/* Description */}
            {property.description && (
              <section>
                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </section>
            )}

            <Separator />

            {/* Property Details */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Property details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Property Type
                  </p>
                  <p className="text-base font-medium">
                    {propertyTypeLabels[property.propertyType] ||
                      property.propertyType}
                  </p>
                </div>
                {property.yearBuilt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Year Built
                    </p>
                    <p className="text-base font-medium">
                      {property.yearBuilt}
                    </p>
                  </div>
                )}
                {property.buildingSqFt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Building Size
                    </p>
                    <p className="text-base font-medium">
                      {property.buildingSqFt.toLocaleString()} sq ft
                    </p>
                  </div>
                )}
                {property.lotSqFt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lot Size</p>
                    <p className="text-base font-medium">
                      {property.lotSqFt.toLocaleString()} sq ft
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Unit Type
                  </p>
                  <p className="text-base font-medium">
                    {isMultiUnit ? "Multi-Unit" : "Single-Unit"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-base font-medium capitalize">
                    {property.propertyStatus.replace("_", " ")}
                  </p>
                </div>
              </div>
            </section>

            {/* Units Section - Only for Multi-Unit */}
            {isMultiUnit && (
              <>
                <Separator />
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                      Units ({property.units.length})
                    </h2>
                    <Button variant="outline" disabled>
                      Add Unit
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {property.units.map((unit) => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between p-5 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-8">
                          <h3 className="text-lg font-semibold min-w-20">
                            Unit {unit.unitNumber}
                          </h3>
                          <div className="flex items-center gap-6 text-base text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Bed className="size-4" />
                              <span>{unit.bedrooms} bed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Bath className="size-4" />
                              <span>{unit.bathrooms} bath</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-xl">
                          <DollarSign className="size-5" />
                          <span>
                            {parseFloat(unit.rentAmount).toLocaleString()}
                            <span className="text-sm text-muted-foreground font-normal">
                              /mo
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {(property.contactEmail || property.contactPhone) && (
              <section className="border rounded-lg p-6 bg-muted/30">
                <h3 className="text-lg font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {property.contactEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Email
                        </p>
                        <p className="text-sm font-medium break-all">
                          {property.contactEmail}
                        </p>
                      </div>
                    </div>
                  )}
                  {property.contactPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Phone
                        </p>
                        <p className="text-sm font-medium">
                          {property.contactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
