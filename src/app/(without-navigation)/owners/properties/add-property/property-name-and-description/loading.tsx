import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyNameAndDescriptionLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-lg border p-6">
            {/* Property Name field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full max-w-sm" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Property Description field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full max-w-lg" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
