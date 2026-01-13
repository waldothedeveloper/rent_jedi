"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { KeySquare } from "lucide-react";
import Link from "next/link";
import { Sheet } from "@/components/ui/sheet";
import tenantImg from "@/app/images/tenants-2-bw.png";
import { useState } from "react";

export function EmptyStateTenants() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Empty className="border-2 border-dashed m-12">
        <EmptyHeader>
          <EmptyMedia className="w-auto h-96">
            <Image
              className="size-full object-cover rounded-full"
              src={tenantImg}
              alt="Tenant Figures and a Plant"
            />
          </EmptyMedia>
          <EmptyTitle>Add Your First Tenant</EmptyTitle>
          <EmptyDescription>
            The architecture is still, waiting for a story to begin. Create a
            first tenant to give the space its soul.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/owners/tenants/add-tenant">
            <Button
              className="flex items-center justify-center gap-2"
              variant="outline"
              size="sm"
            >
              Create Tenant
              <KeySquare className="size-3 text-muted-foreground" />
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    </Sheet>
  );
}
