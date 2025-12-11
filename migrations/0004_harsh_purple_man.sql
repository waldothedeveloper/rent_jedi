CREATE TYPE "public"."maintenance_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('open', 'in_progress', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."initial_late_fee_type" AS ENUM('flat', 'percent_rent', 'percent_unpaid');--> statement-breakpoint
CREATE TYPE "public"."late_fee_limit_type" AS ENUM('no_limit', 'stop_after_days', 'max_total_flat', 'max_total_percent_rent');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'late', 'waived');--> statement-breakpoint
CREATE TABLE "maintenance_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"tenant_id" uuid,
	"created_by_landlord_id" text,
	"created_by_tenant_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "maintenance_status" DEFAULT 'open' NOT NULL,
	"priority" "maintenance_priority" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"photos" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	CONSTRAINT "maintenance_request_resolved_requires_timestamp" CHECK ("maintenance_request"."status" != 'resolved' OR "maintenance_request"."resolved_at" IS NOT NULL),
	CONSTRAINT "maintenance_request_creator_present" CHECK ("maintenance_request"."created_by_landlord_id" IS NOT NULL OR "maintenance_request"."created_by_tenant_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"unit_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"due_date" date NOT NULL,
	"paid_date" date,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"initial_late_fee_type" "initial_late_fee_type",
	"initial_late_fee_value" numeric(12, 2),
	"initial_late_fee_days_from_due" integer,
	"daily_late_fee_amount" numeric(12, 2),
	"daily_late_fee_start_day" integer,
	"late_fee_limit_type" "late_fee_limit_type" DEFAULT 'no_limit',
	"late_fee_limit_stop_after_days" integer,
	"late_fee_limit_amount" numeric(12, 2),
	"late_fee_limit_percent_of_rent" numeric(6, 2),
	CONSTRAINT "payment_amount_non_negative" CHECK ("payment"."amount" >= 0),
	CONSTRAINT "payment_paid_date_for_paid_status" CHECK ("payment"."status" != 'paid' OR "payment"."paid_date" IS NOT NULL),
	CONSTRAINT "payment_initial_fee_value_non_negative" CHECK ("payment"."initial_late_fee_value" IS NULL OR "payment"."initial_late_fee_value" >= 0),
	CONSTRAINT "payment_daily_fee_amount_non_negative" CHECK ("payment"."daily_late_fee_amount" IS NULL OR "payment"."daily_late_fee_amount" >= 0),
	CONSTRAINT "payment_initial_fee_day_range" CHECK ("payment"."initial_late_fee_days_from_due" IS NULL OR ("payment"."initial_late_fee_days_from_due" BETWEEN 1 AND 31)),
	CONSTRAINT "payment_daily_fee_day_range" CHECK ("payment"."daily_late_fee_start_day" IS NULL OR ("payment"."daily_late_fee_start_day" BETWEEN 2 AND 31)),
	CONSTRAINT "payment_initial_fee_percent_range" CHECK ("payment"."initial_late_fee_type" NOT IN ('percent_rent','percent_unpaid') OR "payment"."initial_late_fee_value" BETWEEN 0 AND 100),
	CONSTRAINT "payment_initial_fee_requires_fields" CHECK (
        "payment"."initial_late_fee_type" IS NULL
        OR (
          "payment"."initial_late_fee_value" IS NOT NULL
          AND "payment"."initial_late_fee_days_from_due" BETWEEN 1 AND 31
        )
      ),
	CONSTRAINT "payment_daily_fee_requires_fields" CHECK (
        "payment"."daily_late_fee_amount" IS NULL
        OR (
          "payment"."daily_late_fee_start_day" BETWEEN 2 AND 31
        )
      ),
	CONSTRAINT "payment_limit_percent_range" CHECK ("payment"."late_fee_limit_type" != 'max_total_percent_rent' OR "payment"."late_fee_limit_percent_of_rent" BETWEEN 0 AND 100),
	CONSTRAINT "payment_limit_type_requirements" CHECK (
        (
          "payment"."late_fee_limit_type" != 'stop_after_days'
          OR "payment"."late_fee_limit_stop_after_days" BETWEEN 1 AND 31
        )
        AND (
          "payment"."late_fee_limit_type" != 'max_total_flat'
          OR "payment"."late_fee_limit_amount" IS NOT NULL
        )
        AND (
          "payment"."late_fee_limit_type" != 'max_total_percent_rent'
          OR "payment"."late_fee_limit_percent_of_rent" IS NOT NULL
        )
      )
);
--> statement-breakpoint
ALTER TABLE "tenant" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "tenant" DROP CONSTRAINT "tenant_lease_dates_ordered";--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_unit_id_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_created_by_landlord_id_user_id_fk" FOREIGN KEY ("created_by_landlord_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_request" ADD CONSTRAINT "maintenance_request_created_by_tenant_id_tenant_id_fk" FOREIGN KEY ("created_by_tenant_id") REFERENCES "public"."tenant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_unit_id_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "maintenance_request_unit_id_idx" ON "maintenance_request" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "maintenance_request_tenant_id_idx" ON "maintenance_request" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "maintenance_request_created_by_user_id_idx" ON "maintenance_request" USING btree ("created_by_landlord_id");--> statement-breakpoint
CREATE INDEX "maintenance_request_created_by_tenant_id_idx" ON "maintenance_request" USING btree ("created_by_tenant_id");--> statement-breakpoint
CREATE INDEX "payment_tenant_id_idx" ON "payment" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_unit_id_idx" ON "payment" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "payment_due_date_idx" ON "payment" USING btree ("due_date");--> statement-breakpoint
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_lease_dates_ordered" CHECK ("tenant"."lease_end_date" IS NULL OR "tenant"."lease_end_date" > "tenant"."lease_start_date");