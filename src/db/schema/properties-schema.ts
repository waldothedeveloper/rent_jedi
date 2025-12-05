import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { user } from "./auth-schema";

const PHONEREGEX = "^\\+[1-9]\\d{1,14}$";
const EMAILREGEX = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";

export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "active",
  "coming_soon",
  "archived",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "single_family_home",
  "condo",
  "co-op",
  "houseboat",
  "ranch",
  "mobile_home",
  "container_home",
  "split_level",
  "cottage",
  "mediterranean",
  "farmhouse",
  "cabin",
  "bungalow",
  "townhouse",
  "duplex",
  "triplex",
  "fourplex",
  "loft_conversion",
  "penthouse",
  "studio",
  "loft",
  "villa",
  "victorian",
  "colonial",
  "tudor",
  "craftsman",
  "tiny_house",
  "manufactured_home",
  "cape_cod",
  "mansion",
]);

export const property = pgTable(
  "property",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landlordId: text("landlord_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    propertyStatus: propertyStatusEnum("property_status")
      .notNull()
      .default("draft"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    propertyType: propertyTypeEnum("property_type")
      .notNull()
      .default("single_family_home"),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zipCode: text("zip_code").notNull(),
    country: text("country").notNull(),
    yearBuilt: integer("year_built"),
    buildingSqFt: integer("building_sq_ft"),
    lotSqFt: integer("lot_sq_ft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("property_landlord_id_idx").on(table.landlordId),
    uniqueIndex("property_landlord_address_uid").on(
      table.landlordId,
      table.addressLine1,
      table.city,
      table.state,
      table.zipCode,
      table.country
    ),
    check(
      "contact_email_valid",
      sql`${table.contactEmail} IS NULL OR ${table.contactEmail} ~ ${sql.raw(
        `'${EMAILREGEX}'`
      )}`
    ),
    check(
      "contact_phone_e164",
      sql`${table.contactPhone} IS NULL OR ${table.contactPhone} ~ ${sql.raw(
        `'${PHONEREGEX}'`
      )}`
    ),
    check(
      "year_built_range",
      sql`${table.yearBuilt} IS NULL OR (${table.yearBuilt} BETWEEN 1700 AND EXTRACT(YEAR FROM NOW())::int)`
    ),
  ]
);

export const propertyRelations = relations(property, ({ one }) => ({
  landlord: one(user),
}));
