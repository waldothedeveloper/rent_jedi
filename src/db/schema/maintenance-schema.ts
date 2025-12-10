import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { tenant } from "./tenants-schema";
import { unit } from "./units-schema";
import { user } from "./auth-schema";

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "open",
  "in_progress",
  "resolved",
]);

export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
  "low",
  "medium",
  "high",
]);

export const maintenanceRequest = pgTable(
  "maintenance_request",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => unit.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id").references(() => tenant.id, {
      onDelete: "set null",
    }),
    createdByLandlordId: text("created_by_landlord_id").references(
      () => user.id,
      {
        onDelete: "restrict",
      }
    ),
    createdByTenantId: uuid("created_by_tenant_id").references(
      () => tenant.id,
      { onDelete: "restrict" }
    ),
    title: text("title").notNull(),
    description: text("description"),
    status: maintenanceStatusEnum("status").notNull().default("open"),
    priority: maintenancePriorityEnum("priority").notNull().default("medium"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    resolvedAt: timestamp("resolved_at"),
    photos: text("photos")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
  },
  (table) => [
    index("maintenance_request_unit_id_idx").on(table.unitId),
    index("maintenance_request_tenant_id_idx").on(table.tenantId),
    index("maintenance_request_created_by_user_id_idx").on(
      table.createdByLandlordId
    ),
    index("maintenance_request_created_by_tenant_id_idx").on(
      table.createdByTenantId
    ),
    check(
      "maintenance_request_resolved_requires_timestamp",
      sql`${table.status} != 'resolved' OR ${table.resolvedAt} IS NOT NULL`
    ),
    check(
      "maintenance_request_creator_present",
      sql`${table.createdByLandlordId} IS NOT NULL OR ${table.createdByTenantId} IS NOT NULL`
    ),
  ]
);

export const maintenanceRequestRelations = relations(
  maintenanceRequest,
  ({ one }) => ({
    unit: one(unit, {
      fields: [maintenanceRequest.unitId],
      references: [unit.id],
    }),
    tenant: one(tenant, {
      fields: [maintenanceRequest.tenantId],
      references: [tenant.id],
    }),
    createdByUser: one(user, {
      fields: [maintenanceRequest.createdByLandlordId],
      references: [user.id],
    }),
    createdByTenant: one(tenant, {
      fields: [maintenanceRequest.createdByTenantId],
      references: [tenant.id],
    }),
  })
);
