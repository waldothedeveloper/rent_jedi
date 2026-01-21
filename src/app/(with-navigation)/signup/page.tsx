import { SignupForm } from "@/app/(with-navigation)/signup/signup-form";

interface PageProps {
  searchParams: Promise<{ token?: string; role?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SignupForm token={params.token} role={params.role} />
      </div>
    </div>
  );
}
