import { Suspense } from "react";
import AddTenantProgressBar from "./progress-bar";
import AddTenantProgressBarLoading from "./progress-bar-loading";

export default function AddTenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <Suspense fallback={<AddTenantProgressBarLoading />}>
        <AddTenantProgressBar />
      </Suspense>
      {children}
    </div>
  );
}
