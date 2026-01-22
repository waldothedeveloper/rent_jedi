import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, User } from "lucide-react";

import Link from "next/link";

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join Bloom Rent</h1>
          <p className="text-muted-foreground mt-2">
            Choose how you’ll use Bloom Rent.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Landlord Option */}
          <Link href="/signup?role=owner">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <Home className="size-8 text-primary" />
                </div>
                <CardTitle>I'm a Landlord</CardTitle>
                <CardDescription>
                  Manage properties, collect rent, and communicate with tenants.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Tenant Option */}
          <Link href="/signup?role=tenant">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <User className="size-8 text-primary" />
                </div>
                <CardTitle>I'm a Tenant</CardTitle>
                <CardDescription>
                  Pay rent, submit maintenance requests, and stay connected.
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
