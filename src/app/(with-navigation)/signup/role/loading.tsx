import { Skeleton } from "@/components/ui/skeleton";

export default function RoleSelectionLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header skeleton */}
        <div className="text-center">
          <Skeleton className="h-8 w-56 mx-auto mb-2" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Landlord card skeleton */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>

          {/* Tenant card skeleton */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="text-center">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}
