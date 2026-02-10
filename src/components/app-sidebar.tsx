import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import Image from "next/image";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import type { NavMainItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import logo from "@/app/images/bloom_rent_logo.svg";
import { verifySessionDAL } from "@/dal/shared-dal-helpers";

const navItems: NavMainItem[] = [
  {
    title: "Dashboard",
    url: "/owners/dashboard",
    iconName: "Gauge",
    isActive: true,
  },
  {
    title: "Properties",
    url: "/owners/properties",
    iconName: "House",
  },
  {
    title: "Tenants",
    url: "/owners/tenants",
    iconName: "User",
  },
  {
    title: "Payments",
    url: "/owners/payments",
    iconName: "DollarSign",
  },
  {
    title: "Maintenance",
    url: "/owners/maintenance",
    iconName: "Wrench",
  },
  {
    title: "Messages",
    url: "/owners/messages",
    iconName: "MessageCircleMore",
  },
];

export async function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const session = await verifySessionDAL();

  const sidebarUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "user@example.com",
    avatar: session?.user?.image ?? undefined,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/" className="flex items-start gap-2 mt-3 mb-6">
          <div className="text-primary-background flex size-4 items-center justify-center">
            <Image src={logo} alt="Bloom Rent Logo" unoptimized />
          </div>
          <strong>Bloom Rent</strong>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
