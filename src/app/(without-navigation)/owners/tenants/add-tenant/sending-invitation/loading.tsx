import { Skeleton } from "@/components/ui/skeleton";

export default function SendingInvitationLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
      <div className="flex w-full max-w-md flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
