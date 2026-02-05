import {
  ArrowRight,
  Bath,
  BedDouble,
  Bike,
  CalendarCheck,
  Coffee,
  Dog,
  Heart,
  MapPin,
  Moon,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  Train,
  WashingMachine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

export default async function RentalMarketplacePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground my-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-10 top-40 h-64 w-64 rounded-full bg-muted/60 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-16 sm:px-8 lg:px-12 xl:gap-24 xl:px-16 2xl:gap-28 2xl:px-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] xl:gap-16 2xl:gap-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-muted-foreground">
              <Separator orientation="horizontal" className="max-w-12" />
              Tenant-first marketplace
            </div>
            <div className="space-y-6">
              <p className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Find a place that feels like yours from the first tour.
              </p>
              <p className="text-base text-muted-foreground sm:text-lg">
                A curated rental marketplace built for renters: verified
                listings, transparent pricing, and neighborhoods mapped to your
                lifestyle. Browse what&apos;s actually available and book tours
                in minutes.
              </p>
            </div>

            <Card className="flex flex-col gap-4 border-border/80 bg-background/80 p-5 backdrop-blur sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                Downtown, walkable, pet-friendly
              </div>
              <Button className="group w-full sm:w-auto" size="lg">
                Explore listings
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Card>

            <div className="flex flex-wrap gap-6">
              {[
                { label: "Verified listings", value: "1,240+" },
                { label: "Same-day tours", value: "30 min" },
                { label: "Neighborhoods covered", value: "42" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="relative overflow-hidden py-0 gap-0">
              <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
                <Sparkles className="size-3" />
                Top pick this week
              </div>
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80"
                  alt="Sunlit living room with modern furniture"
                  width={1400}
                  height={900}
                  className="h-80 w-full object-cover sm:h-[420px]"
                  priority
                />
              </div>
              <div className="grid gap-3 p-6">
                <p className="text-2xl font-semibold">Harborline Lofts</p>
                <div className="flex flex-wrap items-center gap-3 text-base text-muted-foreground sm:text-sm">
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="size-5 sm:size-4" />2 bed
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bath className="size-5 sm:size-4" />2 bath
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <WashingMachine className="size-5 sm:size-4" />
                    In-unit laundry
                  </span>
                </div>
                <div className="flex items-center justify-end text-sm">
                  <span className="font-semibold">$2,450 / mo</span>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Marina Daylight",
                  beds: "Studio",
                  baths: "1 bath",
                  extraIcon: Ruler,
                  price: "$1,840 / mo",
                  image:
                    "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80",
                },
                {
                  title: "Juniper Terrace",
                  beds: "1 bed",
                  baths: "1 bath",

                  price: "$2,120 / mo",
                  image:
                    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
                },
              ].map((listing) => (
                <Card
                  key={listing.title}
                  className="overflow-hidden py-0 gap-0"
                >
                  <div className="relative h-40">
                    <Image
                      src={listing.image}
                      alt={`${listing.title} apartment interior`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-lg font-semibold">{listing.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:text-xs">
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="size-4 sm:size-3" />
                        {listing.beds}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bath className="size-4 sm:size-3" />
                        {listing.baths}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{listing.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] xl:gap-16 2xl:gap-20">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              Why renters stay
            </p>
            <p className="text-3xl font-semibold sm:text-4xl">
              Everything you need to choose a home, not just a unit.
            </p>
            <p className="text-muted-foreground">
              We built Rent Jedi to surface availability faster, match you with
              the right neighborhood, and give you the data landlords usually
              keep hidden.
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified availability",
                  description:
                    "Listings refresh daily with live inventory checks and transparent fees.",
                },
                {
                  icon: CalendarCheck,
                  title: "Book tours instantly",
                  description:
                    "Reserve in-person or virtual tours with confirmations in minutes.",
                },
                {
                  icon: Sparkles,
                  title: "Neighborhood match",
                  description:
                    "Filter by commute, walkability, noise, and lifestyle insights.",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
                    <feature.icon className="size-4 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden border-border/70 bg-muted/30 py-0 gap-0">
            <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
              <Star className="size-3" />
              Neighborhood spotlight
            </div>
            <Image
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"
              alt="Cozy apartment with natural light"
              width={1400}
              height={900}
              className="h-[260px] w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="space-y-4 p-6">
              <div>
                <p className="text-2xl font-semibold">
                  Riverside Arts District
                </p>
                <p className="text-sm text-muted-foreground">
                  12 min to downtown · 92 walk score · Average rent $2,050
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm uppercase tracking-[0.2em] text-foreground sm:text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                  <Coffee className="size-4 sm:size-3" />
                  Cafe culture
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                  <Bike className="size-4 sm:size-3" />
                  Bike lanes
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                  <Moon className="size-4 sm:size-3" />
                  Night markets
                </span>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
                Available now
              </p>
              <p className="text-3xl font-semibold sm:text-4xl">
                Fresh listings, updated daily.
              </p>
            </div>
            <Button variant="outline" className="group" size="lg">
              View all properties
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "North Point Residences",
                beds: "2 bed",
                baths: "1 bath",
                extra: "Pet friendly",
                extraIcon: Dog,
                price: "$2,320 / mo",
                image:
                  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Elm Street Flats",
                beds: "1 bed",
                baths: "1 bath",
                extra: "10 min to metro",
                extraIcon: Train,
                price: "$1,980 / mo",
                image:
                  "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1200&q=80",
              },
              {
                title: "Vista Verde",
                beds: "3 bed",
                baths: "2 bath",
                extra: "Parking",
                price: "$2,850 / mo",
                image:
                  "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80",
              },
            ].map((listing) => (
              <Card
                key={listing.title}
                className="group overflow-hidden py-0 gap-0"
              >
                <div className="relative h-48">
                  <Image
                    src={listing.image}
                    alt={`${listing.title} preview`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
                    <Heart className="size-3" />
                    Save
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <p className="text-xl font-semibold">{listing.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:text-xs">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="size-4 sm:size-3" />
                      {listing.beds}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="size-4 sm:size-3" />
                      {listing.baths}
                    </span>
                    {listing.extra ? (
                      <span className="inline-flex items-center gap-1 tracking-[0.2em]">
                        {listing.extraIcon ? (
                          <listing.extraIcon className="size-4 sm:size-3" />
                        ) : null}
                        {listing.extra}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available now</span>
                    <span className="font-semibold">{listing.price}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-10 rounded-3xl border border-border/70 bg-muted p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
              How it works
            </p>
            <p className="text-3xl font-semibold sm:text-4xl">
              Three steps from scroll to signed.
            </p>
            <div className="space-y-5">
              {[
                "Tell us your must-haves and budget range.",
                "Browse verified listings with transparent fees.",
                "Book tours and apply in a single flow.",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                    0{index + 1}
                  </div>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="border-border/70 bg-background p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Live metrics
              </p>
              <p className="text-2xl font-semibold">4,820 tours booked</p>
              <p className="text-sm text-muted-foreground">
                Past 30 days across 18 neighborhoods.
              </p>
            </Card>
            <Card className="border-border/70 bg-background p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Landlord ready
              </p>
              <p className="text-2xl font-semibold">List your property</p>
              <p className="text-sm text-muted-foreground">
                Reach qualified renters and manage applications in one place.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href="/owners/properties">Go to Property Management</Link>
              </Button>
            </Card>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">
            Ready to move?
          </p>
          <p className="text-3xl font-semibold sm:text-4xl">
            Your next home is waiting on the map.
          </p>
          <p className="max-w-xl text-muted-foreground">
            Join the renter community that gets the whole picture: real-time
            availability, fair pricing, and trusted property teams.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg">Start browsing</Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/owners/properties">List a property</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
