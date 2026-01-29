"use client";

import {
  ArrowRight,
  Calendar,
  Check,
  FileSearch,
  MessageSquare,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Static data hoisted to module level to prevent recreation on each render
const PROBLEM_FEATURES = [
  {
    name: "Late payments",
    description:
      "Rent day comes and goes. You send reminders. They promise tomorrow. Tomorrow turns into next week.",
    icon: Calendar,
  },
  {
    name: "Venmo requests at 11pm",
    description:
      "Text messages. Venmo requests. PayPal links. Cash App. Every tenant pays differently. You track it all manually.",
    icon: MessageSquare,
  },
  {
    name: "Texts about broken toilets",
    description:
      "Maintenance requests arrive as texts at all hours. No photos. No details. Just 'something's broken.'",
    icon: Wrench,
  },
  {
    name: "Lost in paperwork",
    description:
      "Leases in email. Inspection photos in your camera roll. Payment records in spreadsheets. Nothing is where you need it.",
    icon: FileSearch,
  },
] as const;

const SOLUTION_FEATURES = [
  {
    title: "Get paid. Every month. On time.",
    description:
      "Rent collects itself. No reminders. No follow-ups. Just money in your account on the 1st.",
  },
  {
    title: "Find anything in 3 seconds",
    description:
      "Every lease. Every document. Every payment. Search once. Done.",
  },
  {
    title: "Tenants help themselves",
    description:
      "They pay rent, report issues, and access documents on their own. Your phone stays silent.",
  },
] as const;

const HOW_IT_WORKS_STEPS = [
  {
    number: "1",
    title: "Add your properties",
    description: "Address, units, rent amounts. Five minutes, start to finish.",
  },
  {
    number: "2",
    title: "Invite your tenants",
    description: "Send a link. They create an account. You're connected.",
  },
  {
    number: "3",
    title: "Collect rent automatically",
    description: "Rent arrives on the 1st. Every month. No chasing.",
  },
] as const;

const TRUST_FEATURES = [
  "Automatic rent collection",
  "Late payment reminders (sent for you)",
  "Maintenance requests (no more texts)",
  "Document storage (find anything instantly)",
  "Tenant portal (they handle it themselves)",
  "Lease tracking (never miss a renewal)",
] as const;

export default function Home() {
  return (
    <main className="relative bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Trust Builders */}
      <TrustBuildersSection />

      {/* Pricing */}
      {/* <PricingSection /> */}

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function HeroSection() {
  const heroRef = useScrollAnimation(0.1);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center px-6 py-32 md:py-40"
    >
      <div className="max-w-5xl mx-auto text-center space-y-12">
        {/* Main Headline */}
        <div className="fade-in-element opacity-0 [animation-delay:100ms]">
          <Badge variant="secondary" className="mb-4 font-semibold">
            Coming Soon in 2026
          </Badge>
          <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-light tracking-[-0.04em] leading-[0.9] text-foreground">
            Rent.
            <br />
            Get Paid.
          </h1>
        </div>

        {/* Subheadline */}
        <div className="fade-in-element opacity-0 [animation-delay:300ms]">
          <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-muted-foreground font-light tracking-tight max-w-2xl mx-auto leading-relaxed">
            Stop chasing rent. Start collecting it.
          </p>
        </div>

        {/* CTA */}
        <div className="fade-in-element opacity-0 [animation-delay:500ms] flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="h-12 px-8 text-base rounded-full font-medium hover:scale-[1.02] transition-transform"
            asChild
          >
            <Link href="/signup">
              Start Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground font-light">
            Free forever for your first property
          </p>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const sectionRef = useScrollAnimation(0.2);

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-32 md:py-40 border-t border-border/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-5 lg:gap-20">
          {/* Title - 2 columns on large screens */}
          <div className="fade-in-element opacity-0 lg:col-span-2">
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] leading-tight text-foreground">
              You became a landlord for income. Not a second job.
            </h2>
          </div>

          {/* Features Grid - 3 columns on large screens */}
          <dl className="lg:col-span-3 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2">
            {PROBLEM_FEATURES.map((feature, idx) => (
              <div
                key={feature.name}
                className={`fade-in-element opacity-0 [animation-delay:${
                  (idx + 1) * 150
                }ms]`}
              >
                <dt className="text-[clamp(1.125rem,2vw,1.25rem)] font-light text-foreground">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-foreground">
                    <feature.icon
                      aria-hidden="true"
                      className="size-6 text-background"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-3 text-[clamp(1rem,2vw,1.125rem)] text-muted-foreground font-light leading-relaxed">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const sectionRef = useScrollAnimation(0.1);

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-32 md:py-40 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="fade-in-element opacity-0 text-center">
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] leading-tight text-foreground">
            What if it just worked?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {SOLUTION_FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className={`fade-in-element opacity-0 [animation-delay:${
                (idx + 1) * 200
              }ms] space-y-6`}
            >
              <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-light tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="text-[clamp(1rem,2vw,1.125rem)] text-muted-foreground font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const sectionRef = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef} className="relative px-6 py-32 md:py-40">
      <div className="max-w-4xl mx-auto space-y-20">
        <div className="fade-in-element opacity-0 text-center">
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] leading-tight text-foreground">
            Three steps. That&apos;s it.
          </h2>
        </div>

        <div className="space-y-16">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`fade-in-element opacity-0 [animation-delay:${
                (idx + 1) * 200
              }ms] flex flex-col md:flex-row gap-8 items-start`}
            >
              <div className="shrink-0 w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-light">
                {step.number}
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-light tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-[clamp(1rem,2vw,1.125rem)] text-muted-foreground font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBuildersSection() {
  const sectionRef = useScrollAnimation(0.1);

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-32 md:py-40 bg-muted/30"
    >
      <div className="max-w-4xl mx-auto space-y-20">
        <div className="fade-in-element opacity-0 text-center space-y-6">
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] leading-tight text-foreground">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground font-light">
            Whether you own a duplex or a portfolio.
          </p>
        </div>

        <div className="fade-in-element opacity-0 [animation-delay:200ms] grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {TRUST_FEATURES.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Check className="size-5 text-foreground shrink-0" />
              <span className="text-[clamp(1rem,2vw,1.125rem)] text-foreground font-light">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const sectionRef = useScrollAnimation(0.1);

  return (
    <section ref={sectionRef} className="relative px-6 py-32 md:py-40">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        <div className="fade-in-element opacity-0">
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-[-0.02em] leading-tight text-foreground">
            Free to start. Pay when rent flows.
          </h2>
        </div>

        <div className="fade-in-element opacity-0 [animation-delay:200ms] space-y-6">
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            Use Bloom free until you collect your first rent payment. Then
            it&apos;s 1% per transaction.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  const sectionRef = useScrollAnimation(0.1);

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-32 md:py-40 bg-muted/30"
    >
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="fade-in-element opacity-0">
          <Badge variant="secondary" className="mb-4 font-semibold">
            Coming Soon in 2026
          </Badge>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light tracking-[-0.02em] leading-tight text-foreground">
            Stop chasing rent. Start your first property today.
          </h2>
        </div>

        <div className="fade-in-element opacity-0 [animation-delay:200ms] flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="h-12 px-8 text-base rounded-full font-medium hover:scale-[1.02] transition-transform"
            asChild
          >
            <Link href="/signup">
              Start Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground font-light">
            Add your first property in 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative px-6 py-16 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-sm text-muted-foreground font-light">
          Built for landlords who&apos;d rather not think about rent collection.
        </p>
      </div>
    </footer>
  );
}
