"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { CreatePropertyForm } from "./create-property-form";
import Image from "next/image";
import { Leaf } from "lucide-react";
import houseImg from "@/app/images/abstract-house.png";
import { useState } from "react";

export function EmptyStateProperty() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Empty className="border-2 border-dashed">
        <EmptyHeader>
          <EmptyMedia className="w-auto h-72 rounded-xl">
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
          <SheetTrigger asChild>
            <Button
              className="flex items-center justify-center gap-2"
              variant="outline"
              size="sm"
            >
              Create Property
              <Leaf className="size-3 text-muted-foreground" />
              {/* <span className="text-muted-foreground">&#8594;</span> */}
            </Button>
          </SheetTrigger>
        </EmptyContent>
      </Empty>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-3xl">
        <SheetHeader className="pb-0">
          <SheetTitle>Create a property</SheetTitle>
          <SheetDescription>
            Start with the essentials. You can add pricing, photos, and
            availability after saving.
          </SheetDescription>
        </SheetHeader>
        <CreatePropertyForm
          className="px-4 pb-6"
          onSubmitted={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
