import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, Search } from "lucide-react";

import Link from "next/link";

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">What brings you to Bloom Rent?</h1>
          <p className="text-muted-foreground mt-2">
            We'll personalize your experience based on your needs
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Owner Intent Option */}
          <Link href="/signup?intent=owner">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <Home className="size-8 text-primary" />
                </div>
                <CardTitle>I want to manage my properties</CardTitle>
                <CardDescription>
                  List properties, manage units, track rent, and handle maintenance requests.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Tenant Intent Option */}
          <Link href="/signup?intent=tenant">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <Search className="size-8 text-primary" />
                </div>
                <CardTitle>I'm looking for rental properties</CardTitle>
                <CardDescription>
                  Browse available rentals and find your next home.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
