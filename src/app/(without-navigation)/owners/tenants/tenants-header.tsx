"use client";

import { Pen, Plus, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function TenantsHeader() {
  return (
    <div className="border-b border-muted pb-5 flex items-center justify-between">
      <h3 className="text-base font-semibold text-foreground dark:text-background">
        Your Tenants
      </h3>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Settings className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href="/owners/tenants/add-tenant"
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" />
                Add Tenant
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/owners/tenants/add-tenant"
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Pen className="size-4" />
                Edit Tenant
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash2 className="size-4" />
              Delete Tenant
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden sm:flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/owners/tenants/add-tenant">
              <Plus aria-hidden="true" className="size-4" />
              Add Tenant
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link
              className="flex items-center gap-1.5"
              href="/owners/tenants/add-tenant"
            >
              <Pen aria-hidden="true" className="size-4" />
              <span>Edit Tenant</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center">
            <Trash2 aria-hidden="true" className="size-4" />
            <span>Delete Tenant</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
