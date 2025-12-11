import {
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { tenant } from "./tenants-schema";
import { unit } from "./units-schema";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "late",
  "waived",
]);

export const initialLateFeeTypeEnum = pgEnum("initial_late_fee_type", [
  "flat",
  "percent_rent",
  "percent_unpaid",
]);

export const lateFeeLimitTypeEnum = pgEnum("late_fee_limit_type", [
  "no_limit",
  "stop_after_days",
  "max_total_flat",
  "max_total_percent_rent",
]);

export const payment = pgTable(
  "payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenant.id, { onDelete: "cascade" }),
    unitId: uuid("unit_id").references(() => unit.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    dueDate: date("due_date").notNull(),
    paidDate: date("paid_date"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    initialLateFeeType: initialLateFeeTypeEnum("initial_late_fee_type"),
    initialLateFeeValue: numeric("initial_late_fee_value", {
      precision: 12,
      scale: 2,
    }),
    initialLateFeeDaysFromDue: integer("initial_late_fee_days_from_due"),
    dailyLateFeeAmount: numeric("daily_late_fee_amount", {
      precision: 12,
      scale: 2,
    }),
    dailyLateFeeStartDay: integer("daily_late_fee_start_day"),
    lateFeeLimitType: lateFeeLimitTypeEnum("late_fee_limit_type").default(
      "no_limit"
    ),
    lateFeeLimitStopAfterDays: integer("late_fee_limit_stop_after_days"),
    lateFeeLimitAmount: numeric("late_fee_limit_amount", {
      precision: 12,
      scale: 2,
    }),
    lateFeeLimitPercentOfRent: numeric("late_fee_limit_percent_of_rent", {
      precision: 6,
      scale: 2,
    }),
  },
  (table) => [
    index("payment_tenant_id_idx").on(table.tenantId),
    index("payment_unit_id_idx").on(table.unitId),
    index("payment_due_date_idx").on(table.dueDate),
    check("payment_amount_non_negative", sql`${table.amount} >= 0`),
    check(
      "payment_paid_date_for_paid_status",
      sql`${table.status} != 'paid' OR ${table.paidDate} IS NOT NULL`
    ),
    check(
      "payment_initial_fee_value_non_negative",
      sql`${table.initialLateFeeValue} IS NULL OR ${table.initialLateFeeValue} >= 0`
    ),
    check(
      "payment_daily_fee_amount_non_negative",
      sql`${table.dailyLateFeeAmount} IS NULL OR ${table.dailyLateFeeAmount} >= 0`
    ),
    check(
      "payment_initial_fee_day_range",
      sql`${table.initialLateFeeDaysFromDue} IS NULL OR (${table.initialLateFeeDaysFromDue} BETWEEN 1 AND 31)`
    ),
    check(
      "payment_daily_fee_day_range",
      sql`${table.dailyLateFeeStartDay} IS NULL OR (${table.dailyLateFeeStartDay} BETWEEN 2 AND 31)`
    ),
    check(
      "payment_initial_fee_percent_range",
      sql`${table.initialLateFeeType} NOT IN ('percent_rent','percent_unpaid') OR ${table.initialLateFeeValue} BETWEEN 0 AND 100`
    ),
    check(
      "payment_initial_fee_requires_fields",
      sql`
        ${table.initialLateFeeType} IS NULL
        OR (
          ${table.initialLateFeeValue} IS NOT NULL
          AND ${table.initialLateFeeDaysFromDue} BETWEEN 1 AND 31
        )
      `
    ),
    check(
      "payment_daily_fee_requires_fields",
      sql`
        ${table.dailyLateFeeAmount} IS NULL
        OR (
          ${table.dailyLateFeeStartDay} BETWEEN 2 AND 31
        )
      `
    ),
    check(
      "payment_limit_percent_range",
      sql`${table.lateFeeLimitType} != 'max_total_percent_rent' OR ${table.lateFeeLimitPercentOfRent} BETWEEN 0 AND 100`
    ),
    check(
      "payment_limit_type_requirements",
      sql`
        (
          ${table.lateFeeLimitType} != 'stop_after_days'
          OR ${table.lateFeeLimitStopAfterDays} BETWEEN 1 AND 31
        )
        AND (
          ${table.lateFeeLimitType} != 'max_total_flat'
          OR ${table.lateFeeLimitAmount} IS NOT NULL
        )
        AND (
          ${table.lateFeeLimitType} != 'max_total_percent_rent'
          OR ${table.lateFeeLimitPercentOfRent} IS NOT NULL
        )
      `
    ),
  ]
);

export const paymentRelations = relations(payment, ({ one }) => ({
  tenant: one(tenant, {
    fields: [payment.tenantId],
    references: [tenant.id],
  }),
  unit: one(unit, {
    fields: [payment.unitId],
    references: [unit.id],
  }),
}));
