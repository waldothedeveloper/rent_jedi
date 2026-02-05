import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Onest } from "next/font/google";

const bodyFont = Onest({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export default function RentalMarketplaceLoading() {
  return (
    <div
      className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-background text-foreground`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-10 top-40 h-64 w-64 rounded-full bg-muted/60 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16 lg:px-10">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <Skeleton className="h-4 w-40" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full max-w-xl" />
              <Skeleton className="h-12 w-4/5 max-w-lg" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-3/4 max-w-lg" />
            </div>

            <Card className="flex flex-col gap-4 border-border/80 bg-background/80 p-5 shadow-[0_20px_60px_-40px_hsl(var(--foreground)/0.35)] backdrop-blur sm:flex-row sm:items-center">
              <Skeleton className="h-11 w-full rounded-full sm:w-72" />
              <Skeleton className="h-11 w-full rounded-full sm:w-40" />
            </Card>

            <div className="flex flex-wrap gap-6">
              {["", "", ""].map((item, index) => (
                <div key={`${item}-${index}`} className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="overflow-hidden border-border/70 bg-muted/30">
              <Skeleton className="h-[320px] w-full sm:h-[420px]" />
              <div className="grid gap-2 p-6">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {["", ""].map((item, index) => (
                <Card key={`${item}-${index}`} className="overflow-hidden border-border/70 bg-background">
                  <Skeleton className="h-40 w-full" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <div className="space-y-4">
              {[0, 1, 2].map((value) => (
                <div key={value} className="flex gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-border/70 bg-muted/30">
            <Skeleton className="h-[260px] w-full" />
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex flex-wrap gap-3">
                {["", "", ""].map((item, index) => (
                  <Skeleton key={`${item}-${index}`} className="h-8 w-24 rounded-full" />
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-72" />
            </div>
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((value) => (
              <Card key={value} className="overflow-hidden border-border/70 bg-background">
                <Skeleton className="h-48 w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-10 rounded-3xl border border-border/70 bg-muted/30 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="space-y-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-72" />
            <div className="space-y-4">
              {[0, 1, 2].map((value) => (
                <div key={value} className="flex items-start gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <Skeleton className="h-4 w-60" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="border-border/70 bg-background p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-6 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </Card>
            <Card className="border-border/70 bg-background p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-6 w-1/2" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-4 h-10 w-full rounded-full" />
            </Card>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 text-center">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-3/4 max-w-lg" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </section>
      </main>
    </div>
  );
}
