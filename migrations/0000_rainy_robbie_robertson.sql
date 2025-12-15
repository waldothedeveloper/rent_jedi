CREATE TYPE "public"."property_status" AS ENUM('draft', 'active', 'coming_soon', 'archived');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'single_family_home', 'condo', 'co-op', 'houseboat', 'ranch', 'mobile_home', 'container_home', 'split_level', 'cottage', 'mediterranean', 'farmhouse', 'cabin', 'bungalow', 'townhouse', 'duplex', 'triplex', 'fourplex', 'loft_conversion', 'penthouse', 'studio', 'loft', 'villa', 'victorian', 'colonial', 'tudor', 'craftsman', 'tiny_house', 'manufactured_home', 'cape_cod', 'mansion');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landlord_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"property_status" "property_status" DEFAULT 'draft' NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"property_type" "property_type" DEFAULT 'single_family_home' NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text NOT NULL,
	"year_built" integer,
	"building_sq_ft" integer,
	"lot_sq_ft" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contact_email_valid" CHECK ("property"."contact_email" IS NULL OR "property"."contact_email" ~ $1),
	CONSTRAINT "contact_phone_e164" CHECK ("property"."contact_phone" IS NULL OR "property"."contact_phone" ~ $1),
	CONSTRAINT "year_built_range" CHECK ("property"."year_built" IS NULL OR ("property"."year_built" BETWEEN 1700 AND EXTRACT(YEAR FROM NOW())::int))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_landlord_id_user_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "property_landlord_id_idx" ON "property" USING btree ("landlord_id");--> statement-breakpoint
CREATE UNIQUE INDEX "property_landlord_address_uid" ON "property" USING btree ("landlord_id","address_line_1","city","state","zip_code","country");