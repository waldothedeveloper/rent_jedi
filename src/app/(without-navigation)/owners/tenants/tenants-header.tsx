"use client";

import { Archive, Mail, Pen, Plus, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import type { TenantWithDetails } from "@/dal/tenants";
import { sendTenantInvitation } from "@/app/actions/invites";
import { archiveTenant } from "@/app/actions/tenants";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TenantsHeaderProps {
  selectedTenant: TenantWithDetails | null;
}

export function TenantsHeader({ selectedTenant }: TenantsHeaderProps) {
  const [isResending, setIsResending] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();

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

  const handleArchiveClick = () => {
    if (!selectedTenant) return;

    // Check if tenant is already archived
    if (selectedTenant.tenantStatus === "archived") {
      toast.error("Tenant is already archived");
      return;
    }

    // Open confirmation dialog
    setArchiveDialogOpen(true);
  };

  const handleArchive = async () => {
    if (!selectedTenant) return;

    setIsArchiving(true);

    try {
      const result = await archiveTenant(selectedTenant.id);

      if (!result.success) {
        toast.error(result.message || "Failed to archive tenant");
        setArchiveDialogOpen(false);
        return;
      }

      toast.success("Tenant archived successfully");
      setArchiveDialogOpen(false);

      // Redirect to tenants list after successful archive
      router.push("/owners/tenants");
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsArchiving(false);
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
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleArchiveClick();
                  }}
                >
                  <Archive className="size-4" />
                  Archive Tenant
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
              <Button
                variant="ghost"
                className="flex items-center"
                onClick={handleArchiveClick}
              >
                <Archive aria-hidden="true" className="size-4" />
                <span>Archive Tenant</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Tenant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive{" "}
              <strong>{selectedTenant?.name || "this tenant"}</strong> and end their
              lease.
              <span className="block mt-2">
                All payment history, maintenance requests, and invitations will be
                preserved for audit purposes.
              </span>
              {selectedTenant?.tenantStatus === "active" && (
                <span className="block mt-2 text-muted-foreground">
                  The lease end date will be set to today, and the tenant status will
                  change to "archived".
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <Button onClick={handleArchive} disabled={isArchiving}>
              {isArchiving ? "Archiving..." : "Yes, archive tenant"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
