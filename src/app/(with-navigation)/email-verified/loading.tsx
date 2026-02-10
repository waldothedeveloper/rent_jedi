import { SharedAuthHeader } from "@/components/shared-auth-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-muted/60 p-6 md:p-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--color-muted)_0%,_transparent_56%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_var(--color-background))]"
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col gap-8 animate-in fade-in-0 zoom-in-95 duration-500">
        <SharedAuthHeader />
        <div className="relative py-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative space-y-6">
            <div className="space-y-4 text-center">
              <Skeleton className="mx-auto h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="mx-auto h-3 w-28" />
                <Skeleton className="mx-auto h-8 w-52" />
                <Skeleton className="mx-auto h-4 w-full max-w-sm" />
                <Skeleton className="mx-auto h-4 w-64" />
              </div>
            </div>
            <Skeleton className="mx-auto h-10 w-full max-w-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
