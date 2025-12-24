"use client";

import * as React from "react";

import {
  AudioWaveform,
  Command,
  DollarSign,
  GalleryVerticalEnd,
  House,
  MessageCircleMore,
  Wrench,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import type { User } from "better-auth";

// This is sample data.
const data = {
  teams: [
    {
      name: "Bloom Rent",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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
        <TeamSwitcher teams={data.teams} />
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
