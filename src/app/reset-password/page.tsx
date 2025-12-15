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

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <SharedAuthHeader />
        <ResetPasswordForm
          token={token}
          error={error}
          usernameHint={usernameHint}
        />
      </div>
    </div>
  );
}
