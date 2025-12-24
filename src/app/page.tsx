import { BarChart3, Building2, Key, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type React from "react";
import { SharedAuthHeader } from "@/components/shared-auth-header";

export default function Home() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="flex items-center gap-3 my-8 mx-4">
        <SharedAuthHeader />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 md:py-32 py-16 sm:px-6 lg:px-8 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <Badge
                variant="outline"
                className="w-fit border-chart-2/30 text-chart-2 bg-chart-2/5 font-bold"
              >
                Coming soon in 2026
              </Badge>

              <h1 className="text-5xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
                Rental management,{" "}
                <span className="text-chart-2">reimagined.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-md">
                Intelligent tools. Effortless operations. Maximum returns.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <FeatureItem
                icon={<Building2 className="size-4" />}
                text="Properties"
              />
              <FeatureItem icon={<Key className="size-4" />} text="Tenants" />
              <FeatureItem
                icon={<BarChart3 className="size-4" />}
                text="Analytics"
              />
              <FeatureItem
                icon={<Shield className="size-4" />}
                text="Payments"
              />
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-foreground p-px bg-linear-to-b from-chart-2/20 to-transparent">
              <div className="size-full overflow-hidden rounded-3xl bg-foreground">
                <Image
                  src="https://images.unsplash.com/photo-1650137938625-11576502aecd?q=80&w=1053&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Modern rental property"
                  fill
                  className="object-cover opacity-80"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-foreground via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-sm text-background uppercase tracking-widest max-w-xs">
                    A brilliant way to manage your rental properties...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-chart-2">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
