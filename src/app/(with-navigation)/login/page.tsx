import { LoginForm } from "@/app/(with-navigation)/login/login-form";

interface PageProps {
  searchParams: Promise<{ token?: string; role?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm token={params.token} role={params.role} />
      </div>
    </div>
  );
}
