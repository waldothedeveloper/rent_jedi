import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function InviteWelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle2 className="h-24 w-24 text-green-500" />
        </div>

        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome to Bloom Rent!
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Your account has been successfully created
          </p>
        </div>

        {/* Next Steps */}
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            What&apos;s Next?
          </h2>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3">
              <div className="shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Check Your Email</h3>
                <p className="mt-1 text-sm text-gray-600">
                  We&apos;ve sent a verification email to your inbox. Please
                  verify your email address to access all features.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Log In to Your Account
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  After verifying your email, log in to access your tenant
                  dashboard and manage your rental.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Explore Your Dashboard
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  View property details, pay rent, submit maintenance requests,
                  and communicate with your landlord.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Features Overview */}
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            What You Can Do
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Pay Rent Online</h3>
                <p className="text-sm text-gray-600">
                  Securely pay rent through the platform
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Maintenance Requests
                </h3>
                <p className="text-sm text-gray-600">
                  Submit and track maintenance issues
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  View Lease Details
                </h3>
                <p className="text-sm text-gray-600">
                  Access your lease information anytime
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Message Your Landlord
                </h3>
                <p className="text-sm text-gray-600">
                  Communicate directly through the app
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Go to Login
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-600">
            Questions? Contact your landlord or{" "}
            <a
              href="/contact-support"
              className="text-blue-600 hover:underline"
            >
              reach out to our support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
