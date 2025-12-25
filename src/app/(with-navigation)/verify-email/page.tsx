import { EmailForm } from "./email-form";
import Link from "next/link";
import { SharedAuthHeader } from "@/components/shared-auth-header";

export default async function VerifyEmailPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col gap-12">
        <SharedAuthHeader />
        <div className="flex flex-col gap-12 rounded-md bg-background p-8 shadow-md">
          <h1 className="text-center text-2xl font-semibold">
            Please Verify Your Email
          </h1>
          <div className="text-center">
            <p>Almost there! We’ve sent a verification link to your email.</p>
            <p className="text-center">
              Click it to confirm your email and complete your Bloom Rent
              training. <br />
              If you don’t see it, <strong>check your spam folder.</strong>
            </p>
          </div>

          <EmailForm />
          <div className="flex items-center justify-center gap-2 text-center">
            <p>Need help? </p>
            <Link href="/contact-support" className="hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
