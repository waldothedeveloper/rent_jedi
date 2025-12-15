import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { property } from "./properties-schema";

export const unit = pgTable(
  "unit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => property.id, { onDelete: "cascade" }),
    unitNumber: text("unit_number").notNull(),
    bedrooms: integer("bedrooms").notNull().default(0),
    bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }).notNull(),
    rentAmount: numeric("rent_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("unit_property_id_idx").on(table.propertyId),
    uniqueIndex("unit_property_unit_number_uid").on(
      table.propertyId,
      table.unitNumber
    ),
    check("unit_bedrooms_non_negative", sql`${table.bedrooms} >= 0`),
    check("unit_bathrooms_non_negative", sql`${table.bathrooms} >= 0`),
    check("unit_rent_amount_non_negative", sql`${table.rentAmount} >= 0`),
  ]
);

export const unitRelations = relations(unit, ({ one }) => ({
  property: one(property, {
    fields: [unit.propertyId],
    references: [property.id],
  }),
}));
