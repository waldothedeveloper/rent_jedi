"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { Fraunces, Onest } from "next/font/google";

const displayFont = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });
const bodyFont = Onest({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export default function RentalMarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-background text-foreground`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-10 top-40 h-64 w-64 rounded-full bg-muted/60 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 py-16 text-center lg:px-10">
        <Card className="w-full max-w-2xl border-border/70 bg-background/90 p-8 shadow-[0_30px_80px_-60px_hsl(var(--foreground)/0.5)] backdrop-blur">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-border bg-muted/60">
            <AlertCircle className="size-7 text-foreground" />
          </div>
          <p className={`${displayFont.className} text-3xl font-semibold sm:text-4xl`}>
            We lost this listing.
          </p>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {error.message || "We couldn’t load the rental marketplace just now."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} size="lg" className="group">
              Try again
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/owners/properties">Go to Property Management</Link>
            </Button>
          </div>
        </Card>

        <div className="grid w-full gap-4 md:grid-cols-3">
          {[
            {
              title: "Search nearby",
              detail: "Explore listings around your commute radius.",
            },
            {
              title: "Save your filters",
              detail: "Keep alerts on for new availability drops.",
            },
            {
              title: "Talk to a host",
              detail: "Get same-day answers from property teams.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/70 bg-background p-5 text-left">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                <MapPin className="size-4" />
                Suggested step
              </div>
              <p className={`${displayFont.className} mt-3 text-lg font-semibold`}>{item.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
