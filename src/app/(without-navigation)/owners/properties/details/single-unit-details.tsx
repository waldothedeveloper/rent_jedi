"use client";

import {
  Bath,
  Bed,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Ruler,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyActions } from "./property-actions";
import { Separator } from "@/components/ui/separator";
import { formatPropertyType } from "./helpers";
import { property } from "@/db/schema/properties-schema";
import { unit } from "@/db/schema/units-schema";
import { useState } from "react";

type PropertyWithUnits = typeof property.$inferSelect & {
  units: (typeof unit.$inferSelect)[];
};

interface PropertyDetailsProps {
  property: PropertyWithUnits;
}

export function SingleUnitDetails({ property }: PropertyDetailsProps) {
  const [expandedSections, setExpandedSections] = useState({
    interior: true,
    monthly: true,
    neighborhood: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="size-full">
      {/* Header */}
      <PropertyActions property={property} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-3">
          <div className="md:col-span-2">
            <h1 className="text-5xl md:text-7xl font-semibold text-balance mb-8">
              <span className="text-border font-extralight">/</span>{" "}
              {property.name || "Property Name Goes Here."}
              <span className="ml-2 text-base text-muted-foreground">
                {property.name ? "" : "(Edit me)"}
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xs md:max-w-xl leading-relaxed mb-16">
              {property.description || "Add a property description."}
            </p>
            {property.units.map((unit) => (
              <div key={unit.id}>
                <div>
                  <p className="text-muted-foreground">Rent Amount</p>
                  <p className="mt-2 text-2xl md:text-4xl font-semibold flex items-center">
                    <DollarSign className="size-5" />
                    {parseFloat(unit.rentAmount).toLocaleString()}
                    <span className="ml-1 text-base font-normal">/month</span>
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground">Security Deposit</p>
                  <p className="mt-2 text-xl md:text-2xl text-muted-foreground flex items-center">
                    <DollarSign className="size-5 text-muted-foreground" />
                    {unit.securityDepositAmount
                      ? parseFloat(unit.securityDepositAmount).toLocaleString()
                      : "Not set"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Property Beds, Baths, SquareFeet,  */}
          <div className="mt-16 md:mt-0 grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="text-3xl md:text-4xl mb-4">
                  {property.units[0]?.bedrooms || 0}
                </div>
                <div className="text-base text-muted-foreground">
                  <Bed className="size-5 md:size-6 mb-2 text-muted-foreground" />
                  Beds
                </div>
              </div>
              <Separator orientation="horizontal" className="h-5 max-w-xs" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-3xl md:text-4xl mb-4">
                  {property.units[0]?.bathrooms || 0}
                </div>
                <div className="text-base text-muted-foreground">
                  <Bath className="size-5 md:size-6 mb-2 text-muted-foreground" />
                  Bath
                </div>
              </div>
              <Separator orientation="horizontal" className="h-5 max-w-xs" />
            </div>
            {property.yearBuilt && (
              <div className="space-y-4">
                <div>
                  <div className="text-3xl md:text-4xl mb-4">
                    {property.yearBuilt}
                  </div>
                  <div className="text-base text-muted-foreground">
                    <Calendar className="size-5 md:size-6 mb-2 text-muted-foreground" />
                    Year Built
                  </div>
                </div>
                <Separator orientation="horizontal" className="h-5 max-w-xs" />
              </div>
            )}
            {property.lotSqFt && (
              <div className="space-y-4">
                <div>
                  <div className="text-3xl md:text-4xl mb-4">
                    {property.lotSqFt}{" "}
                    <span className="text-base text-muted-foreground">Ft²</span>
                  </div>
                  <div className="text-base text-muted-foreground">
                    <Ruler className="size-5 md:size-6 mb-2 text-muted-foreground" />
                    Lot Size
                  </div>
                </div>
                <Separator orientation="horizontal" className="h-5 max-w-xs" />
              </div>
            )}
            {property.propertyType && (
              <div className="space-y-4">
                <div className="text-3xl md:text-4xl mb-4">
                  {formatPropertyType(property.propertyType)}
                </div>
                <div className="text-base text-muted-foreground">
                  <Building className="size-5 md:size-6 mb-2 text-muted-foreground" />
                  Property Type
                </div>
                <Separator orientation="horizontal" className="h-5 max-w-xs" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Property Details Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-5xl font-light mb-8">
          <span className="text-border font-extralight">/</span> Property
          Details
        </h2>
        <p className="text-muted-foreground mb-12 max-w-3xl leading-relaxed">
          This exquisite home features luxurious design, innovative spaces,
          modern amenities, and stunning architecture, offering unparalleled
          comfort and convenience for a luxurious living experience.
        </p>

        {/* Interior Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <button
              onClick={() => toggleSection("interior")}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Interior</span>
              </div>
              {expandedSections.interior ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.interior && (
              <div className="grid md:grid-cols-3 gap-6 pt-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    No. 1
                  </div>
                  <h3 className="font-semibold mb-2">Modern Elegance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Clean lines, minimalist decor, and neutral tones that add
                    harmony, natural light, and calming aesthetics to
                    sophisticated interiors.
                  </p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    No. 2
                  </div>
                  <h3 className="font-semibold mb-2">Classic Comfort</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Timeless design with warm hues, traditional furniture, and
                    cozy accents creating an inviting and enduring appeal.
                  </p>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    No. 3
                  </div>
                  <h3 className="font-semibold mb-2">Contemporary Chic</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cutting-edge designs with bold colors, sleek lines, and art
                    pieces creating dynamic, stylish living spaces.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Payment Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <button
              onClick={() => toggleSection("monthly")}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Monthly payment</span>
              </div>
              {expandedSections.monthly ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {expandedSections.monthly && (
              <div className="pt-4 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      FineCost™ for this home
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Home price
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$1,243,000</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Monthly payment</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$1,680</div>
                    <div className="text-xs text-blue-600">
                      <a href="#" className="hover:underline">
                        or get fixed cost at $1.82k
                      </a>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown Bar */}
                <div className="w-full h-2 rounded-full overflow-hidden flex">
                  <div className="bg-red-500" style={{ width: "60%" }} />
                  <div className="bg-orange-500" style={{ width: "15%" }} />
                  <div className="bg-yellow-500" style={{ width: "10%" }} />
                  <div className="bg-blue-500" style={{ width: "8%" }} />
                  <div className="bg-pink-500" style={{ width: "7%" }} />
                </div>

                {/* Payment Items */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Principal & Interest</span>
                    </div>
                    <span className="font-medium">$1,560</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>Property Taxes</span>
                    </div>
                    <span className="font-medium">$45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>Home Insurance</span>
                    </div>
                    <span className="font-medium">$35</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>HOA fees</span>
                    </div>
                    <span className="font-medium">$25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                      <span>Mortgage Insurance</span>
                    </div>
                    <span className="font-medium">$0</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <div>
                      <div>Total due at close</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        Home payment (20%)
                      </div>
                      <div className="text-xs text-muted-foreground font-normal">
                        12 x 100
                      </div>
                    </div>
                    <div className="text-right">
                      <div>$71,760</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        $68,840
                      </div>
                      <div className="text-xs text-muted-foreground font-normal">
                        $11,000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Neighborhood Section */}
        <Card>
          <CardContent className="p-6">
            <button
              onClick={() => toggleSection("neighborhood")}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  Neighborhood & schools
                </span>
              </div>
              {expandedSections.neighborhood ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Contact Broker Section */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-5xl font-bold mb-6 leading-tight text-balance">
                Contact
                <br />
                Broker
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Receive personalized assistance, expert advice and answers for
                property-related, meetings, and tailored advice.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Name
                </label>
                <Input
                  placeholder="Connecting with a property expert for answers, details, and personalized help"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full name
                </label>
                <Input placeholder="Full name" className="bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="Email.com"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  How can we help you?
                </label>
                <Input
                  placeholder="Type your messages here"
                  className="bg-white"
                />
              </div>
              <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6">
                Send
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
