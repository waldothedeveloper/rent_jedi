import { SendingClient } from "./sending-client";

interface PageProps {
  searchParams: Promise<{
    tenantId?: string;
    unitId?: string;
    propertyId?: string;
  }>;
}

export default async function SendingInvitationPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  if (!params.tenantId || !params.unitId || !params.propertyId) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 md:p-10 mt-12">
        <div className="flex w-full max-w-md flex-col gap-4 text-center">
          <h1 className="text-2xl font-semibold text-destructive">
            Missing Information
          </h1>
          <p className="text-sm text-muted-foreground">
            Required parameters are missing. Please go back and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SendingClient
      tenantId={params.tenantId}
      unitId={params.unitId}
      propertyId={params.propertyId}
    />
  );
}
