import { SharedAuthHeader } from "@/components/shared-auth-header";
import { SignupForm } from "@/app/signup/signup-form";

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SharedAuthHeader />
        <SignupForm />
      </div>
    </div>
  );
}
