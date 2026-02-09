import { getSessionOrRedirect } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clock3,
  FileWarning,
  Server,
  Shield,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { redirect } from "next/navigation";

const KPI_CARDS = [
  {
    label: "Total active landlords",
    value: "3,842",
    delta: "+8.2% this month",
    icon: Building2,
  },
  {
    label: "Active renters",
    value: "27,416",
    delta: "+12.4% this month",
    icon: Users,
  },
  {
    label: "Rent volume (30d)",
    value: "$2.48M",
    delta: "+5.7% via Stripe",
    icon: Banknote,
  },
  {
    label: "Platform uptime",
    value: "99.97%",
    delta: "No incident in 21 days",
    icon: Server,
  },
] as const;

const LANDLORD_QUEUE = [
  { title: "Identity review", count: "12", tone: "High priority" },
  { title: "New listing approvals", count: "37", tone: "Needs moderation" },
  { title: "Lease disputes", count: "6", tone: "Owner support" },
] as const;

const TENANT_QUEUE = [
  { title: "Application flags", count: "9", tone: "Manual check" },
  { title: "Payment failures", count: "24", tone: "Retry in progress" },
  { title: "Tour request overflow", count: "18", tone: "Routing assist" },
] as const;

const RECENT_ACTIVITY = [
  {
    title: "Bulk rent payouts completed",
    detail: "1,204 payouts processed across 612 properties",
    time: "7 min ago",
    icon: CheckCircle2,
  },
  {
    title: "Marketplace anomaly detected",
    detail: "Unusual listing duplication in two metro areas",
    time: "21 min ago",
    icon: AlertTriangle,
  },
  {
    title: "Maintenance SLA breach warning",
    detail: "14 tickets approaching 48-hour response threshold",
    time: "44 min ago",
    icon: Wrench,
  },
  {
    title: "Compliance export generated",
    detail: "Monthly transaction report ready for finance review",
    time: "1h ago",
    icon: Shield,
  },
] as const;

export default async function AdminDashboard() {
  const session = await getSessionOrRedirect();

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="relative flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 top-6 h-52 w-52 rounded-full bg-primary/10 blur-[90px]" />
        <div className="absolute right-0 top-24 h-48 w-48 rounded-full bg-muted blur-[100px]" />
      </div>

      <section className="rounded-3xl border border-border/70 bg-background/80 p-6 backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="secondary">Admin Console</Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Platform Command Center
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Unified operational view for marketplace growth, payment flow
              health, moderation queues, and platform reliability.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live status
            </p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="size-4 text-foreground" />
              Operational across all core services
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((item) => (
          <Card key={item.label} className="border-border/70 bg-background/80 p-5">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <item.icon className="size-4 text-foreground" />
              {item.label}
            </p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.delta}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-background/80 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-semibold">Operations Queue</p>
            <Badge variant="outline" className="gap-1">
              <Clock3 className="size-3.5" />
              Updated 2 minutes ago
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl bg-muted/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Landlord Operations
              </p>
              {LANDLORD_QUEUE.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl bg-background/80 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.tone}</p>
                  </div>
                  <p className="text-lg font-semibold">{item.count}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl bg-muted/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Tenant Operations
              </p>
              {TENANT_QUEUE.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-xl bg-background/80 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.tone}</p>
                  </div>
                  <p className="text-lg font-semibold">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-background/80 p-5 sm:p-6">
          <p className="text-lg font-semibold">Risk + Compliance</p>
          <div className="mt-4 space-y-3">
            {[
              {
                title: "KYC checks pending",
                value: "14",
                icon: UserCheck,
              },
              {
                title: "Flagged transactions",
                value: "3",
                icon: FileWarning,
              },
              {
                title: "Security alerts",
                value: "0",
                icon: Shield,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-xl bg-muted/35 px-4 py-3"
              >
                <p className="inline-flex items-center gap-2 text-sm">
                  <item.icon className="size-4 text-foreground" />
                  {item.title}
                </p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 bg-background/80 p-5 sm:p-6">
          <p className="text-lg font-semibold">Revenue Snapshot</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Static preview of platform fee distribution and payout velocity.
          </p>

          <div className="mt-6 space-y-4">
            {[
              { label: "Gross rent processed", value: "$2.48M", width: "w-full" },
              { label: "Platform fee (1%)", value: "$24.8K", width: "w-2/3" },
              { label: "Successful payouts", value: "96.2%", width: "w-5/6" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full bg-foreground ${item.width}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 bg-background/80 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Recent Platform Activity</p>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item) => (
              <div key={item.title} className="rounded-xl bg-muted/30 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-medium">
                  <item.icon className="size-4 text-foreground" />
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {item.time}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
