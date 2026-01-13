import { Skeleton } from "@/components/ui/skeleton";

export default function AddTenantProgressBarLoading() {
  return (
    <>
      {/* Mobile */}
      <nav
        aria-label="Progress"
        className="flex items-center justify-center md:hidden"
      >
        <Skeleton className="h-4 w-24" />
        <ol role="list" className="ml-8 flex items-center space-x-5">
          {[1, 2, 3].map((i) => (
            <li key={i}>
              <Skeleton className="size-2.5 rounded-full" />
            </li>
          ))}
        </ol>
      </nav>

      {/* Desktop */}
      <nav aria-label="Progress" className="hidden md:block">
        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {[1, 2, 3].map((i) => (
            <li key={i} className="md:flex-1">
              <div className="flex flex-col border-l-4 border-border py-2 pl-4 md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
