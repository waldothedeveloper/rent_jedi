import { Skeleton } from "@/components/ui/skeleton";

export default function EditTenantLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="flex flex-col gap-6">
          {/* Basic Information Section */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Contact Information Section */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Property & Unit Section */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-32" />
            <div className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          <Skeleton className="h-px w-full" />

          {/* Lease Information Section */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
