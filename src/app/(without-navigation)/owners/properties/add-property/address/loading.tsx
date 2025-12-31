import { Skeleton } from "@/components/ui/skeleton";

export default function AddressLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-lg border p-6">
            <Skeleton className="h-5 w-24 mb-2" />

            {/* Street address */}
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>

            {/* Apartment/suite */}
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-9 w-full" />
            </div>

            {/* City and State */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>

            {/* ZIP and Country */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
