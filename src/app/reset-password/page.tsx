import Link from "next/link";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";
import { SharedAuthHeader } from "@/components/shared-auth-header";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const usernameHint =
    typeof params.email === "string"
      ? params.email
      : typeof params.username === "string"
        ? params.username
        : undefined;

  const showErrorState = !!error;

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SharedAuthHeader />
        {showErrorState ? (
          <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="space-y-1">
              <p className="text-lg font-semibold">Something went wrong.</p>
              <p className="text-sm text-muted-foreground">
                We apologize for the inconvenience. Choose an option below to
                get back in.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Request a new password reset link
              </Link>
              <Link
                href="/contact-support"
                className="text-primary hover:underline"
              >
                Contact support
              </Link>
              <Link href="/login" className="text-primary hover:underline">
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <ResetPasswordForm
            token={token}
            error={error}
            usernameHint={usernameHint}
          />
        )}
      </div>
    </div>
  );
}
