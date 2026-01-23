import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              <Skeleton className="mx-auto h-8 w-52" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mx-auto h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid gap-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="mx-auto h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
