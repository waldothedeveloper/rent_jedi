import { validateInviteToken } from "@/app/actions/invites";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InviteAcceptPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  // No token provided
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Invalid Invitation Link
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This invitation link is missing required information. Please check
              your email for the correct link or contact your landlord.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate the token
  const result = await validateInviteToken(token);

  // Token validation failed
  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              {result.message?.includes("expired")
                ? "Invitation Expired"
                : result.message?.includes("already been")
                  ? "Invitation Already Used"
                  : "Invalid Invitation"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
            {result.message?.includes("expired") && (
              <p className="mt-4 text-sm text-muted-foreground">
                Please contact your landlord to request a new invitation.
              </p>
            )}
            {result.message?.includes("already been accepted") && (
              <p className="mt-4 text-sm text-muted-foreground">
                If you already have an account, you can{" "}
                <a href="/login" className="text-primary hover:underline">
                  sign in here
                </a>
                .
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inviteData = result.data;

  // Extract first name from inviteeName
  const firstName = inviteData.inviteeName?.split(" ")[0] || "there";

  // Success - show minimal welcome with navigation options
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome, {firstName}!
          </h2>
          <p className="mt-4 text-muted-foreground">
            You&apos;ve been invited by your property manager to set up a tenant
            account with Bloom Rent.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href={`/signup?token=${token}&role=tenant`}
            className="inline-flex w-full items-center justify-center rounded-md
                       bg-primary px-6 py-3 text-sm font-medium text-primary-foreground
                       hover:bg-primary/90 focus:outline-none focus:ring-2
                       focus:ring-ring focus:ring-offset-2"
          >
            Create New Account
          </Link>

          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login?token=${token}&role=tenant`}
              className="text-primary hover:underline"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
