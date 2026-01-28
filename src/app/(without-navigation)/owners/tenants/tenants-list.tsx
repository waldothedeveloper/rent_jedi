"use client";

import { ChevronLeft, ChevronRight, User } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatPhoneFromE164,
} from "@/utils/form-helpers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TenantWithDetails } from "@/dal/tenants";
import type { InviteWithDetails } from "@/dal/invites";
import { TenantsHeader } from "./tenants-header";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface TenantsListProps {
  tenants: TenantWithDetails[];
  invites?: InviteWithDetails[];
}

export function TenantsList({ tenants, invites = [] }: TenantsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTenantId = searchParams.get("tenantId");

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  // Find the most recent invite for the selected tenant
  const selectedTenantInvite = selectedTenant
    ? invites
        .filter((inv) => inv.tenantId === selectedTenant.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0]
    : undefined;

  const handleTenantSelect = (tenantId: string) => {
    router.push(`/owners/tenants?tenantId=${tenantId}`, { scroll: false });
  };

  const getInviteStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <TenantsHeader
        selectedTenant={selectedTenant ?? null}
        inviteStatus={selectedTenantInvite?.status}
        inviteId={selectedTenantInvite?.id}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-6 md:flex-row">
        {selectedTenantId && (
          <div className="flex items-center md:hidden">
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => router.push("/owners/tenants", { scroll: false })}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Back to Tenants
            </Button>
          </div>
        )}
        {/* Sidebar - Tenant List */}
        <aside
          className={cn(
            "w-full shrink-0 overflow-y-auto md:w-96",
            selectedTenantId ? "hidden md:block" : "block",
          )}
        >
          <ul
            role="list"
            className="divide-y divide-border overflow-hidden shadow-xs outline -outline-offset-1 outline-border/50 sm:rounded-xl dark:shadow-none"
          >
            {tenants.map((tenant) => (
              <li key={tenant.id}>
                <button
                  type="button"
                  className={cn(
                    "relative flex w-full items-center justify-between gap-x-6 px-4 py-5 text-left hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:px-6",
                    selectedTenantId === tenant.id && "bg-muted",
                    tenant.tenantStatus === "draft" &&
                      "bg-destructive/8 hover:bg-destructive/18",
                  )}
                  aria-current={
                    selectedTenantId === tenant.id ? "true" : undefined
                  }
                  onClick={() => handleTenantSelect(tenant.id)}
                >
                  <div className="flex min-w-0 gap-x-4">
                    <div className="flex size-12 flex-none items-center justify-center rounded-full bg-muted dark:outline dark:-outline-offset-1 dark:outline-border/50">
                      <User
                        className="size-6 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-auto">
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      <div className="flex items-center gap-2">
                        <p className="text-sm/6 font-semibold text-foreground">
                          {tenant.name}
                        </p>
                      </div>
                      <p className="mt-1 flex text-xs/5 text-muted-foreground">
                        {tenant.property && (
                          <span className="truncate">
                            {tenant.property.name}
                            {tenant.unit && ` · ${tenant.unit.unitNumber}`}
                          </span>
                        )}
                      </p>
                      {tenant.tenantStatus === "draft" && (
                        <Badge variant="destructive">
                          Finish Tenant Profile
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm/6 text-foreground">
                        {tenant.unit
                          ? formatCurrency(tenant.unit.rentAmount)
                          : "—"}
                        /mo
                      </p>
                    </div>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-5 flex-none text-muted-foreground"
                    />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main - Tenant Details */}
        <main
          className={cn(
            "relative z-0 flex-1 overflow-y-auto focus:outline-hidden shadow-xs outline -outline-offset-1 outline-border/50 rounded-xl",
            selectedTenantId ? "block" : "hidden md:block",
          )}
        >
          {selectedTenant ? (
            <>
              <article>
                {/* Profile header */}
                <div>
                  <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mt-16 flex items-center space-x-5">
                      <div className="flex">
                        <div className="flex size-24 items-center justify-center rounded-full bg-muted ring-2 ring-muted sm:size-32">
                          <User
                            className="size-12 text-muted-foreground sm:size-16"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <div className="sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                        <div className="min-w-0 flex-1 sm:hidden 2xl:block">
                          <h1 className="truncate text-2xl font-bold text-foreground">
                            {selectedTenant.name}
                          </h1>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-0 flex-1 sm:block 2xl:hidden">
                      <h1 className="truncate text-2xl font-bold text-foreground">
                        {selectedTenant.name}
                      </h1>
                    </div>
                  </div>
                </div>

                {/* Description sections */}
                <div className="mx-auto mt-16 md:mt-24 max-w-5xl space-y-10 px-4 pb-12 sm:px-6 lg:px-8">
                  {/* Contact Information */}
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Email
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {selectedTenant.email ?? "—"}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {selectedTenant.phone
                            ? formatPhoneFromE164(selectedTenant.phone)
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Property & Unit */}
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Property & Unit
                    </h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Property
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {selectedTenant.property ? (
                            <>
                              {selectedTenant.property.name}
                              <br />
                              <span className="text-muted-foreground">
                                {selectedTenant.property.addressLine1},{" "}
                                {selectedTenant.property.city},{" "}
                                {selectedTenant.property.state}
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Unit
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {selectedTenant.unit
                            ? `${selectedTenant.unit.unitNumber} (${selectedTenant.unit.bedrooms} bed · ${selectedTenant.unit.bathrooms} bath)`
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Financial */}
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Financial
                    </h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Monthly Rent
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {formatCurrency(selectedTenant.unit?.rentAmount)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Security Deposit
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {formatCurrency(
                            selectedTenant.unit?.securityDepositAmount,
                          )}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Lease */}
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Lease
                    </h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Lease Start
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {formatDate(selectedTenant.leaseStartDate)}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Lease End
                        </dt>
                        <dd className="mt-1 text-sm text-foreground">
                          {formatDate(selectedTenant.leaseEndDate)}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Invitation Status */}
                  {selectedTenantInvite && (
                    <section>
                      <h2 className="text-sm font-medium text-muted-foreground">
                        Invitation Status
                      </h2>
                      <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-muted-foreground">
                            Status
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {getInviteStatusBadge(selectedTenantInvite.status)}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-muted-foreground">
                            Sent
                          </dt>
                          <dd className="mt-1 text-sm text-foreground">
                            {formatDate(selectedTenantInvite.createdAt)}
                          </dd>
                        </div>
                        {selectedTenantInvite.status === "pending" &&
                          selectedTenantInvite.expiresAt && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-muted-foreground">
                                Expires
                              </dt>
                              <dd className="mt-1 text-sm text-foreground">
                                {formatDate(selectedTenantInvite.expiresAt)}
                              </dd>
                            </div>
                          )}
                        {selectedTenantInvite.status === "accepted" &&
                          selectedTenantInvite.acceptedAt && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-muted-foreground">
                                Accepted
                              </dt>
                              <dd className="mt-1 text-sm text-foreground">
                                {formatDate(selectedTenantInvite.acceptedAt)}
                              </dd>
                            </div>
                          )}
                        {selectedTenantInvite.status === "revoked" &&
                          selectedTenantInvite.revokedAt && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-muted-foreground">
                                Revoked
                              </dt>
                              <dd className="mt-1 text-sm text-foreground">
                                {formatDate(selectedTenantInvite.revokedAt)}
                              </dd>
                            </div>
                          )}
                      </dl>
                    </section>
                  )}

                  {/* Status */}
                  {/* <section>
                    <h2 className="text-sm font-medium text-muted-foreground">
                      Tenant Status
                    </h2>
                    <dl className="mt-4">
                      <div>
                        <dt className="sr-only">Status</dt>
                        <dd className="mt-1 text-sm capitalize text-foreground">
                          {selectedTenant.tenantStatus}
                        </dd>
                      </div>
                    </dl>
                  </section> */}
                </div>
              </article>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                Select a tenant to view details
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
