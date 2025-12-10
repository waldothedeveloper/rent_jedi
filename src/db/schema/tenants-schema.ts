import { EMAILREGEX, PHONEREGEX } from "@/lib/utils";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { unit } from "./units-schema";

export const tenant = pgTable(
  "tenant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => unit.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    leaseStartDate: timestamp("lease_start_date").notNull(),
    leaseEndDate: timestamp("lease_end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tenant_unit_id_idx").on(table.unitId),
    uniqueIndex("tenant_unit_active_uid")
      .on(table.unitId)
      .where(sql`${table.leaseEndDate} IS NULL`),
    check(
      "tenant_lease_dates_ordered",
      sql`${table.leaseEndDate} IS NULL OR ${table.leaseEndDate} > ${table.leaseStartDate}`
    ),
    check(
      "tenant_contact_email_valid",
      sql`${table.email} IS NULL OR ${table.email} ~ ${sql.raw(`'${EMAILREGEX}'`)}`
    ),
    check(
      "tenant_contact_phone_e164",
      sql`${table.phone} IS NULL OR ${table.phone} ~ ${sql.raw(`'${PHONEREGEX}'`)}`
    ),
    check(
      "tenant_contact_method_required",
      sql`${table.email} IS NOT NULL OR ${table.phone} IS NOT NULL`
    ),
  ]
);

export const tenantRelations = relations(tenant, ({ one }) => ({
  unit: one(unit, {
    fields: [tenant.unitId],
    references: [unit.id],
  }),
}));
