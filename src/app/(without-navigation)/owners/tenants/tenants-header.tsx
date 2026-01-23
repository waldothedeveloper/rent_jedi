"use client";

import { Mail, Pen, Plus, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import type { TenantWithDetails } from "@/dal/tenants";
import { sendTenantInvitation } from "@/app/actions/invites";
import { toast } from "sonner";
import { useState } from "react";

interface TenantsHeaderProps {
  selectedTenant: TenantWithDetails | null;
}

export function TenantsHeader({ selectedTenant }: TenantsHeaderProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResendInvitation = async () => {
    if (!selectedTenant?.unitId || !selectedTenant?.property?.id) {
      toast.error("Tenant must be assigned to a unit before sending invitation");
      return;
    }
    if (!selectedTenant?.email) {
      toast.error("Tenant does not have an email address");
      return;
    }

    setIsResending(true);
    try {
      const result = await sendTenantInvitation({
        tenantId: selectedTenant.id,
        unitId: selectedTenant.unitId,
        propertyId: selectedTenant.property.id,
      });
      if (result.success) {
        toast.success("Invitation sent successfully");
      } else {
        toast.error(result.message || "Failed to send invitation");
      }
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setIsResending(false);
    }
  };

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
            {selectedTenant && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/owners/tenants/edit-tenant?tenantId=${selectedTenant.id}`}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pen className="size-4" />
                    Edit Tenant
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleResendInvitation}
                  disabled={isResending}
                >
                  <Mail className="size-4" />
                  {isResending ? "Sending..." : "Re-send Invitation"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash2 className="size-4" />
                  Delete Tenant
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden sm:flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/owners/tenants/add-tenant">
              <Plus aria-hidden="true" className="size-4" />
              Add Tenant
            </Link>
          </Button>
          {selectedTenant && (
            <>
              <Button variant="ghost" asChild>
                <Link
                  className="flex items-center gap-1.5"
                  href={`/owners/tenants/edit-tenant?tenantId=${selectedTenant.id}`}
                >
                  <Pen aria-hidden="true" className="size-4" />
                  <span>Edit Tenant</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center"
                onClick={handleResendInvitation}
                disabled={isResending}
              >
                <Mail aria-hidden="true" className="size-4" />
                <span>{isResending ? "Sending..." : "Re-send Invitation"}</span>
              </Button>
              <Button variant="ghost" className="flex items-center">
                <Trash2 aria-hidden="true" className="size-4" />
                <span>Delete Tenant</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
