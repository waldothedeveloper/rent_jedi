import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  Check,
  CreditCard,
  FileSignature,
  Home,
  Landmark,
  MapPin,
  Megaphone,
  MessageCircleMore,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  UploadCloud,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const MANAGING_PROPERTIES_POINTS = [
  "Track units, leases, and due dates in one workspace",
  "Replace scattered Excel sheets and photo receipts",
  "Keep owner-level visibility across up to 10 properties",
] as const;

const AUTOMATE_PAYMENTS_POINTS = [
  {
    title: "ACH bank payments",
    description:
      "Tenants can pay from linked bank accounts for low-friction monthly rent collection.",
    icon: Landmark,
  },
  {
    title: "Debit and credit cards",
    description:
      "Accept major cards through Stripe with payment status synced automatically.",
    icon: CreditCard,
  },
  {
    title: "Digital wallets and Link",
    description:
      "Support faster checkout with Apple Pay, Google Pay, and Link where available.",
    icon: Smartphone,
  },
] as const;

const MAINTENANCE_POINTS = [
  {
    text: "Tenants submit requests with photos and details",
    icon: Wrench,
  },
  {
    text: "Set status, assign priority, and close with proof",
    icon: CalendarCheck,
  },
  {
    text: "Every conversation stays attached to the ticket",
    icon: Check,
  },
] as const;

const SIGNATURE_POINTS = [
  {
    text: "Generate lease packets with reusable templates",
    icon: FileSignature,
  },
  {
    text: "Collect signatures from any device",
    icon: ShieldCheck,
  },
  {
    text: "Store signed files automatically under each unit",
    icon: Sparkles,
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative my-32 min-h-screen overflow-hidden text-foreground">
      <main className="relative z-10 mx-auto flex w-full max-w-420 flex-col gap-20 px-6 py-16 sm:px-8 lg:px-12 xl:gap-24 xl:px-16 2xl:gap-28 2xl:px-20">
        <section className="relative overflow-hidden px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-muted-foreground">
                <Separator orientation="horizontal" className="max-w-12" />
                Coming soon in 2026
              </div>
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit font-medium">
                  Built for independent landlords and renters
                </Badge>
                <h1 className="text-4xl font-semibold leading-[0.95] tracking-[-0.02em] sm:text-5xl lg:text-6xl xl:text-7xl">
                  Own the full rental
                  <br />
                  operation in one
                  <br />
                  beautiful workflow.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Replace disconnected spreadsheets, payment apps, and message
                  threads with one platform that helps landlords manage faster
                  and helps renters discover available homes.
                </p>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1">
                    Property Ops
                  </span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1">
                    Marketplace Reach
                  </span>
                  <span className="rounded-full border border-border bg-background/70 px-3 py-1">
                    Automated Cash Flow
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button className="group w-full sm:w-auto" size="lg" asChild>
                  <Link href="/signup">
                    Create free account
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  size="lg"
                  asChild
                >
                  <Link href="/rental-marketplace">Explore marketplace</Link>
                </Button>
              </div>

              <Card className="flex flex-col gap-4 border-border/80 bg-background/85 p-5 backdrop-blur sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  Free to start. 1% per tenant payment, charged to landlord.
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
                  <Sparkles className="size-4" />
                  No hidden fees
                </div>
              </Card>
            </div>

            <div className="relative pb-16 lg:pb-8">
              <div className="grid gap-4 sm:grid-cols-12">
                <Card className="overflow-hidden border-border/70 p-0 shadow-2xl shadow-primary/10 sm:col-span-12">
                  <Image
                    src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80"
                    alt="Modern apartment interior with open kitchen and living area"
                    width={1800}
                    height={1200}
                    priority
                    className="h-80 w-full object-cover sm:h-[360px] lg:h-[390px]"
                  />
                </Card>
                <Card className="overflow-hidden border-border/70 p-0 sm:col-span-7 sm:-mt-8 sm:ml-6 lg:ml-10">
                  <Image
                    src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1400&q=80"
                    alt="Landlord and tenant reviewing lease details together"
                    width={1400}
                    height={900}
                    className="h-[180px] w-full object-cover sm:h-[210px]"
                  />
                </Card>
                <Card className="overflow-hidden border-border/70 p-0 sm:col-span-5 sm:-mr-4 sm:mt-4">
                  <Image
                    src="https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1400&q=80"
                    alt="Apartment building exterior representing available rentals"
                    width={1400}
                    height={900}
                    className="h-[180px] w-full object-cover sm:h-[210px]"
                  />
                </Card>
              </div>

              <Card className="absolute -bottom-2 -left-2 w-[72%] border-border/80 bg-background/92 p-4 shadow-xl backdrop-blur sm:w-[56%]">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Designed for
                </p>
                <p className="mt-2 text-lg font-semibold">
                  1-10 property landlords
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Move from manual tasks to automated operations in under 5
                  minutes.
                </p>
              </Card>

              <Card className="absolute -right-2 top-6 w-[60%] border-border/80 bg-background/92 p-4 shadow-xl backdrop-blur sm:right-2 sm:w-[44%]">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <Banknote className="size-3.5 text-foreground" />
                  Collected this month
                </p>
                <p className="mt-2 text-2xl font-semibold">$18,540</p>
                <p className="text-xs text-muted-foreground">
                  +12% on-time payment rate
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] xl:gap-16 2xl:gap-20">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Manage Properties
            </p>
            <p className="text-3xl font-semibold sm:text-4xl">
              Replace fragmented tools with one operating system.
            </p>
            <p className="text-muted-foreground">
              Stop switching between spreadsheets, notes, receipt photos, and
              payment apps. Keep property operations clean and predictable.
            </p>
            <div className="space-y-3">
              {MANAGING_PROPERTIES_POINTS.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p className="text-sm text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <Image
              src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80"
              alt="Property manager checking listings and paperwork on a laptop"
              width={1400}
              height={900}
              className="h-[340px] w-full object-cover"
            />
            <div className="p-6">
              <p className="text-lg font-semibold">
                Everything tied to each unit
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Rent status, maintenance history, and lease documents stay
                attached to the exact property and tenant.
              </p>
            </div>
          </Card>
        </section>

        <section className="space-y-8 lg:space-y-10">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Advertise your property
            </p>
            <p className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              A free marketplace built for both sides of the rental journey.
            </p>
            <p className="text-muted-foreground">
              Landlords publish and manage listings at no upfront cost, while
              tenants discover, compare, and book tours from one clean flow.
            </p>
          </div>

          <div className="space-y-10 sm:space-y-12 lg:space-y-14">
            <div className="relative px-1 py-2 sm:px-2">
              <div className="pointer-events-none absolute -left-14 top-0 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
              <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Landlord lane
                  </p>
                  <p className="text-2xl font-semibold leading-tight sm:text-3xl">
                    List once. Manage renter demand from one place.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Free marketplace publishing with structured listing controls
                    and centralized inquiry handling.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      title: "Create listing",
                      description:
                        "Add photos, rent amount, and availability in minutes.",
                      icon: UploadCloud,
                    },
                    {
                      title: "Set rent terms",
                      description:
                        "Define lease length, deposit, and screening preferences.",
                      icon: SlidersHorizontal,
                    },
                    {
                      title: "Pin map location",
                      description:
                        "Show neighborhood context and nearby points of interest.",
                      icon: MapPin,
                    },
                    {
                      title: "Respond to inquiries",
                      description:
                        "Keep every renter conversation inside one thread.",
                      icon: MessageCircleMore,
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className={`rounded-2xl bg-muted/30 p-4 sm:p-5 ${
                        index % 2 === 0 ? "sm:ml-4" : "sm:mr-6"
                      }`}
                    >
                      <p className="inline-flex items-center gap-2 text-sm font-semibold">
                        <span className="rounded-full bg-background/80 p-1.5">
                          <item.icon className="size-4" />
                        </span>
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative px-1 py-2 sm:px-2">
              <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  {[
                    {
                      title: "Search available homes",
                      description:
                        "Filter listings by budget, bedrooms, and move-in timing.",
                      icon: Search,
                    },
                    {
                      title: "Save favorites",
                      description:
                        "Bookmark units and compare your top choices side by side.",
                      icon: Home,
                    },
                    {
                      title: "Book tours",
                      description:
                        "Request in-person or virtual tours directly from the listing.",
                      icon: CalendarCheck,
                    },
                    {
                      title: "Track applications",
                      description:
                        "Follow status updates from inquiry to signed lease.",
                      icon: Check,
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className={`rounded-2xl bg-muted/30 p-4 sm:p-5 ${
                        index % 2 === 0 ? "sm:mr-4" : "sm:ml-6"
                      }`}
                    >
                      <p className="inline-flex items-center gap-2 text-sm font-semibold">
                        <span className="rounded-full bg-background/80 p-1.5">
                          <item.icon className="size-4" />
                        </span>
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 lg:text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Tenant lane
                  </p>
                  <p className="text-2xl font-semibold leading-tight sm:text-3xl">
                    Discover, compare, and move faster with better listing
                    context.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A cleaner search and touring flow helps qualified renters
                    make decisions quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-muted/20 p-5 text-center sm:p-6 lg:flex-row lg:text-left">
            <div>
              <p className="text-lg font-semibold">
                Publish once and reach renters across the marketplace for free.
              </p>
              <p className="text-sm text-muted-foreground">
                No upfront listing fee. Start attracting qualified inquiries
                immediately.
              </p>
            </div>
            <Button variant="outline" className="group" size="lg" asChild>
              <Link href="/rental-marketplace">
                Explore marketplace
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Automate Payments
            </p>
            <p className="text-3xl font-semibold sm:text-4xl">
              Get paid on time without manual chasing.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {AUTOMATE_PAYMENTS_POINTS.map((point) => (
              <Card key={point.title} className="border-border/80 bg-muted/20 p-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                    <point.icon className="size-3.5 text-foreground" />
                    Stripe payment method
                  </div>
                  <p className="text-lg font-semibold">{point.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden p-0">
            <Image
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80"
              alt="Close-up of digital payment and financial dashboard planning"
              width={1400}
              height={900}
              className="h-80 w-full object-cover"
            />
          </Card>
        </section>

        <section className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Keep track of maintenance tickets
            </p>
            <p className="text-3xl font-semibold sm:text-4xl">
              Turn messy texts into accountable maintenance workflows.
            </p>
            <div className="space-y-3">
              {MAINTENANCE_POINTS.map((point) => (
                <div
                  key={point.text}
                  className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
                >
                  <point.icon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p className="text-sm text-muted-foreground">{point.text}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <Image
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80"
              alt="Technician fixing home maintenance issue in a rental property"
              width={1400}
              height={900}
              className="h-[360px] w-full object-cover"
            />
          </Card>
        </section>

        <section className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <Card className="overflow-hidden p-0">
            <Image
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80"
              alt="Person signing digital lease documents on a tablet"
              width={1400}
              height={900}
              className="h-[360px] w-full object-cover"
            />
          </Card>
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Digital automated signatures
            </p>
            <p className="text-3xl font-semibold sm:text-4xl">
              Move leases from draft to signed without printing.
            </p>
            <div className="space-y-3">
              {SIGNATURE_POINTS.map((point) => (
                <div
                  key={point.text}
                  className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/20 p-4"
                >
                  <point.icon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p className="text-sm text-muted-foreground">{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <Card className="border-border/70 bg-muted/20 p-8 sm:p-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <Badge variant="secondary" className="font-medium">
                Final CTA
              </Badge>
              <p className="text-3xl font-semibold leading-tight sm:text-4xl">
                Start free, simplify your rental operations, and scale with
                confidence.
              </p>
              <p className="text-base text-muted-foreground">
                No monthly fee to begin. When tenants pay through Rent Jedi, we
                charge a 1% transaction fee to the landlord.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button className="group" size="lg" asChild>
                  <Link href="/signup">
                    Create landlord account
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" className="group" size="lg" asChild>
                  <Link href="/rental-marketplace">
                    Find a rental home
                    <Megaphone className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-foreground" />
                Clear pricing. No hidden platform fees.
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                title: "Fast onboarding",
                description: "Set up your first property in minutes.",
              },
              {
                icon: ShieldCheck,
                title: "Transparent pricing",
                description: "1% per tenant payment billed to landlord.",
              },
              {
                icon: Check,
                title: "Actionable workflow",
                description: "Payments, leasing, and tickets in one timeline.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-border/80 bg-background/70 p-5"
              >
                <p className="inline-flex items-center gap-2 text-sm font-semibold">
                  <item.icon className="size-4" />
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
