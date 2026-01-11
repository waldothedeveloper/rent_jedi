import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="py-8 border-b">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Title and Badge */}
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Address */}
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-96" />
              </div>

              {/* Key Stats */}
              <div className="flex flex-wrap items-center gap-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-px" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-px" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-px" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-44" />
              <Skeleton className="h-11 w-32" />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <Skeleton className="h-7 w-56 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </section>

            <Skeleton className="h-px w-full" />

            {/* Property Details */}
            <section>
              <Skeleton className="h-7 w-48 mb-6" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </section>

            <Skeleton className="h-px w-full" />

            {/* Units Section (for multi-unit) */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28" />
              </div>
              <div className="space-y-3">
                <div className="p-5 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <Skeleton className="h-6 w-20" />
                      <div className="flex items-center gap-6">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-7 w-28" />
                  </div>
                </div>
                <div className="p-5 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <Skeleton className="h-6 w-20" />
                      <div className="flex items-center gap-6">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-7 w-28" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <section className="border rounded-lg p-6 bg-muted/30">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
