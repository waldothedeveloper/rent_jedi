import { Suspense } from "react";
import AddPropertyProgressBar from "./progress-bar";
import AddPropertyProgressBarLoading from "./progress-bar-loading";

export default function AddPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <Suspense fallback={<AddPropertyProgressBarLoading />}>
        <AddPropertyProgressBar />
      </Suspense>
      {children}
    </div>
  );
}
