# Bloom Rent - Rent. Get Paid

The most stupidly simple rental management system.

WEEK 1 — Foundation + Skeleton (No UI yet)

Goal: Just get the bones in place. No pretty screens.
You aren’t “building RentJedi” yet — you’re laying the runway.

Tasks:
• Create the Next.js 15 project
• Set up Tailwind + shadcn
• Set up Better Auth for authentication
• Set up Supabase (or Neon) for your DB
• Create the basic tables:
• users (from Better Auth)
• properties
• units
• tenants
• payments
• maintenance_requests

Outcome:
You can log in/out, and the database exists.
That’s enough for week 1.

⸻

WEEK 2 — Landlord Core (Properties + Units)

Goal: Make landlords feel like they have a home base.

Tasks:
• Add “Add Property” page
• Add “Add Unit” page
• Show a list of properties on the dashboard
• Show units under each property
• Create permissions so only owners see their data

Outcome:
You now have a tiny internal tool:
Landlords can create buildings + units.
Still no payments, no tenants, no real activity. That’s fine.

⸻

WEEK 3 — Tenant Invites (Simple + Functional)

Goal: Get people inside the system. This is where the product becomes multi-user.

Tasks:
• Add “Invite Tenant” by email
• When tenant accepts → they get a tenant account
• Tenant sees:
• their unit
• rent amount
• due date
• option to upload docs (later)

Outcome:
You now have landlords and tenants inside the system.
It’s starting to feel like a platform.

⸻

WEEK 4 — Rent Collection (Bare-bones Stripe)

Goal: Make payments possible in the simplest way.

Tasks:
• Integrate Stripe Connect Standard
• Landlord connects their Stripe account
• Tenant can:
• link bank account
• pay rent manually via ACH or debit
• Record payments in your DB
• Display payment history
• Send receipt email via Resend

Outcome:
This is your first “real” MVP milestone.
Rent can be paid.
Money flows.
Trust begins.

From this point on, the app can generate revenue.

⸻

WEEK 5 — Reminders + Notifications

Goal: Increase usefulness and retention.

Tasks:
• Email reminders:
• 3 days before
• day of
• 3 days late
• Optional: basic SMS reminder through Twilio
• Show “Next rent due” on tenant dashboard

Outcome:
Landlords feel like the app is doing real work for them.
This is a high-value feature done cheaply.

⸻

WEEK 6 — Maintenance Requests (Simple, no fancy workflows)

Goal: Add the other anchor feature.

Tasks:
Tenant submits:
• Title
• Description
• Up to 3 photos
• Status defaults to “Open”

Landlord can:
• Change status (Open → In Progress → Done)
• Add notes

Outcome:
This creates stickiness.
Tenants stop texting.
Landlords feel more organized.

⸻

WEEK 7 — Document Vault (Personal Dropbox)

Goal: Provide a place to store leases, receipts, etc.

Tasks:
• Use Supabase storage (cheap, reliable)
• Landlord uploads PDFs
• Landlord assigns docs to specific tenants
• Tenants can download them
• Show list of documents with date + file size

Outcome:
This feature is easy and feels premium despite being simple.

⸻

WEEK 8 — Soft Launch + Stability Polish

Goal: Make it reliable enough for a handful of real people.

Tasks:
• Clean UI
• Fix onboarding friction
• Add small icons + spacing
• Add empty states:
• “No payments yet”
• “No units yet”
• Add a landing homepage for rentjedi.com (“coming soon”)
• Test everything yourself with 1–2 properties
• Ask one friend to use it with their tenant (free)

Outcome:
You now have a genuine MVP.
A tiny SaaS that:
• collects rent
• reminds people
• handles issues
• stores documents
• invites tenants
• runs with nearly zero cost

You can legitimately start charging.

⸻

POST-LAUNCH (MONTH 3 AND 4)

Your only focus:
Get 5 real landlords using it happily.

Once those 5 are stable:
Get to 20.

Once you hit 20, the product tends to grow slowly but reliably on its own through word-of-mouth.
