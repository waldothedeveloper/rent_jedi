import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Building2,
  Landmark,
  UserCircle,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { getSessionOrRedirect } from "@/app/actions/auth";

const SETUP_STEPS = [
  {
    title: "Create a Property",
    description:
      "Add your first rental property with address, type, and unit details.",
    href: "/owners/properties",
    icon: Building2,
  },
  {
    title: "Invite a Tenant",
    description:
      "Send an invite to your tenants so they can view their lease and pay rent.",
    href: "/owners/tenants",
    icon: Users,
  },
  {
    title: "Setup Bank Account",
    description:
      "Connect your bank account to receive rent payments directly.",
    href: "/owners/billing",
    icon: Landmark,
  },
  {
    title: "Complete Your Profile",
    description:
      "Add your contact info and preferences to personalize your experience.",
    href: "/owners/account-settings",
    icon: UserCircle,
  },
] as const;

const ICON_BG = [
  "bg-chart-1/15",
  "bg-chart-2/15",
  "bg-chart-3/15",
  "bg-chart-4/15",
];
const ICON_TEXT = [
  "text-chart-1",
  "text-chart-2",
  "text-chart-3",
  "text-chart-4",
];

export default async function DashboardPage() {
  const { user } = await getSessionOrRedirect();

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Welcome hero */}
      <section className="rounded-3xl border border-border/70 bg-background/80 px-6 py-8 backdrop-blur sm:px-8 sm:py-10">
        <Badge variant="secondary" className="mb-4">
          Getting Started
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to Bloom Rent, {firstName}.
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Let&apos;s get your first property set up. Complete the steps below to
          start managing your rentals and collecting payments.
        </p>
        <Separator className="mt-6" />
      </section>

      {/* Setup actions */}
      <section>
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your next steps
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SETUP_STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <Link key={step.href} href={step.href}>
                <Card
                  className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-md animate-fade-in"
                  style={{ opacity: 0, animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="flex h-full flex-col gap-4">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl ${ICON_BG[index]}`}
                    >
                      <Icon className={`size-6 ${ICON_TEXT[index]}`} />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {step.description}
                      </CardDescription>
                    </div>

                    <p className="flex items-center gap-1 text-sm font-medium text-primary">
                      Get started
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
