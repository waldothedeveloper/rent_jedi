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
import { Leaf } from "lucide-react";
import Link from "next/link";
import { Sheet } from "@/components/ui/sheet";
import houseImg from "@/app/images/abstract-house.png";
import { useState } from "react";

export function EmptyStateProperty() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Empty className="border-2 border-dashed m-2">
        <EmptyHeader>
          <EmptyMedia className="w-auto h-96">
            <Image
              className="size-full object-cover"
              src={houseImg}
              alt="House"
            />
          </EmptyMedia>
          <EmptyTitle>Add Your Rental Property</EmptyTitle>
          <EmptyDescription>
            A quiet horizon, waiting for the first root. Add a rental to begin
            your journey.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/owners/properties/add-property/address">
            <Button
              className="flex items-center justify-center gap-2"
              variant="outline"
              size="sm"
            >
              Create Property
              <Leaf className="size-3 text-muted-foreground" />
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    </Sheet>
  );
}
