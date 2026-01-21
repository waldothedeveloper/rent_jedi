import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Skeleton */}
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-64" />
        </div>

        {/* Property Information Skeleton */}
        <div className="rounded-lg bg-white p-6 shadow">
          <Skeleton className="h-6 w-32" />
          <div className="mt-4 space-y-4">
            <div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-1 h-4 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-1 h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-1 h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="rounded-lg bg-white p-8 shadow">
          {/* Mode Toggle Skeleton */}
          <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
