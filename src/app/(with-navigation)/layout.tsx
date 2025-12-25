import { Navbar } from "@/app/app-navigation-menu";

export default async function WithNavigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
