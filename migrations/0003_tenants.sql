CREATE TABLE "tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"lease_start_date" timestamp NOT NULL,
	"lease_end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_lease_dates_ordered" CHECK ("tenant"."lease_end_date" IS NULL OR "tenant"."lease_end_date" >= "tenant"."lease_start_date"),
	CONSTRAINT "tenant_contact_email_valid" CHECK ("tenant"."email" IS NULL OR "tenant"."email" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
	CONSTRAINT "tenant_contact_phone_e164" CHECK ("tenant"."phone" IS NULL OR "tenant"."phone" ~ '^\+[1-9]\d{1,14}$'),
	CONSTRAINT "tenant_contact_method_required" CHECK ("tenant"."email" IS NOT NULL OR "tenant"."phone" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_unit_id_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tenant_unit_id_idx" ON "tenant" USING btree ("unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_unit_active_uid" ON "tenant" USING btree ("unit_id") WHERE "tenant"."lease_end_date" IS NULL;