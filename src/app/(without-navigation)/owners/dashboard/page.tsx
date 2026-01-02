import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import Link from "next/link";
import { getSessionOrRedirect } from "@/app/actions/auth";

export default async function DashboardPage() {
  const { user } = await getSessionOrRedirect();

  // Check if role is missing (should never happen with database hook)
  const hasMissingRole = !user.role;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Missing Role Alert Dialog */}
      <AlertDialog open={hasMissingRole}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Setup Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Your account is missing some required additional information. This
              is a rare technical issue. Please contact our support team to
              resolve this and gain full access to your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Link
                href="/contact-support"
                className="inline-flex items-center justify-center"
              >
                Contact Support
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Normal Dashboard Content */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {user.role && (
          <p className="text-muted-foreground">
            Welcome back, {user.name || "User"}
          </p>
        )}
      </div>
    </div>
  );
}
