"use client";

import * as React from "react";

import { DollarSign, House, MessageCircleMore, Wrench } from "lucide-react";
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
import { NavUser } from "@/components/nav-user";
import type { User } from "better-auth";
import logo from "@/app/images/bloom_rent_logo.svg";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Properties",
      url: "/owners/properties",
      icon: House,
      isActive: true,
    },
    {
      title: "Maintenance",
      url: "/owners/maintenance",
      icon: Wrench,
    },
    {
      title: "Payments",
      url: "/owners/payments",
      icon: DollarSign,
    },
    {
      title: "Messages",
      url: "/owners/messages",
      icon: MessageCircleMore,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const sidebarUser = {
    name: user.name ?? "User",
    email: user.email ?? "user@example.com",
    avatar: user.image ?? undefined,
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
