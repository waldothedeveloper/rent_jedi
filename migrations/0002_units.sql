CREATE TABLE "unit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_number" text NOT NULL,
	"bedrooms" integer DEFAULT 0 NOT NULL,
	"bathrooms" numeric(3, 1) NOT NULL,
	"rent_amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unit_bedrooms_non_negative" CHECK ("unit"."bedrooms" >= 0),
	CONSTRAINT "unit_bathrooms_non_negative" CHECK ("unit"."bathrooms" >= 0),
	CONSTRAINT "unit_rent_amount_non_negative" CHECK ("unit"."rent_amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "unit" ADD CONSTRAINT "unit_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "unit_property_id_idx" ON "unit" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unit_property_unit_number_uid" ON "unit" USING btree ("property_id","unit_number");