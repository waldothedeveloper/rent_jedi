import { Skeleton } from "@/components/ui/skeleton";

export default function MultiUnitLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col gap-6">
          <div className="space-y-6">
            {/* Unit 1 skeleton */}
            <div className="flex flex-col gap-4 rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
              </div>

              {/* Unit Number */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-full" />
              </div>

              {/* Bedrooms and Bathrooms */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>

              {/* Rent and Deposit */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>

            {/* Add Another Unit button skeleton */}
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-4 w-full" />

          {/* Buttons skeleton */}
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
