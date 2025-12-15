ALTER TABLE "property" DROP CONSTRAINT "contact_email_valid";--> statement-breakpoint
ALTER TABLE "property" DROP CONSTRAINT "contact_phone_e164";--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "contact_email_valid" CHECK ("property"."contact_email" IS NULL OR "property"."contact_email" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "contact_phone_e164" CHECK ("property"."contact_phone" IS NULL OR "property"."contact_phone" ~ '^\+[1-9]\d{1,14}$');