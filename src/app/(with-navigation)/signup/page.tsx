import { SignupForm } from "@/app/(with-navigation)/signup/signup-form";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ token?: string; intent?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const { token, intent } = await searchParams;

  if (!token && !intent) {
    redirect("/signup/role");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm token={token} intent={intent} />
      </div>
    </div>
  );
}
