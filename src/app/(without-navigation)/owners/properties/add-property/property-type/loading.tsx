import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyTypeLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-lg border p-6">
            <Skeleton className="h-5 w-32 mb-2" />

            {/* Radio group skeleton */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>

            <Skeleton className="h-4 w-full mt-2" />
          </div>

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
