"use client";

import {
  DollarSign,
  Gauge,
  House,
  MessageCircleMore,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  // SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  House,
  DollarSign,
  Wrench,
  MessageCircleMore,
  Gauge,
  User,
};

export type NavMainItem = {
  title: string;
  url: string;
  iconName?: string;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({ items }: { items: NavMainItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    // Desktop sidebar remains expanded - no action needed
  };

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Dashboard</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.iconName ? iconMap[item.iconName] : undefined;
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url} onClick={handleLinkClick}>
                    {Icon && <Icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url} onClick={handleLinkClick}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
