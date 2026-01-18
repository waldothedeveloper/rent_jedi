import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { EMAILREGEX } from "@/lib/utils";
import { property } from "./properties-schema";
import { tenant } from "./tenants-schema";
import { user } from "./auth-schema";

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const inviteRoleEnum = pgEnum("invite_role", ["tenant", "manager"]);

export const invite = pgTable(
  "invite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => property.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    managerId: text("manager_id").references(() => user.id, {
      onDelete: "set null",
    }),
    tenantId: uuid("tenant_id").references(() => tenant.id, {
      onDelete: "cascade",
    }),
    inviteeEmail: text("invitee_email").notNull(),
    inviteeName: text("invitee_name"),
    role: inviteRoleEnum("role").notNull(),
    status: inviteStatusEnum("status").notNull().default("pending"),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at"),
    acceptedAt: timestamp("accepted_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("invite_property_id_idx").on(table.propertyId),
    index("invite_owner_id_idx").on(table.ownerId),
    index("invite_manager_id_idx").on(table.managerId),
    index("invite_tenant_id_idx").on(table.tenantId),
    index("invite_status_idx").on(table.status),
    uniqueIndex("invite_property_email_uid").on(
      table.propertyId,
      table.inviteeEmail
    ),
    check(
      "invite_email_valid",
      sql`${table.inviteeEmail} ~ ${sql.raw(`'${EMAILREGEX}'`)}`
    ),
  ]
);

export const inviteRelations = relations(invite, ({ one }) => ({
  property: one(property, {
    fields: [invite.propertyId],
    references: [property.id],
  }),
  owner: one(user, {
    fields: [invite.ownerId],
    references: [user.id],
  }),
  manager: one(user, {
    fields: [invite.managerId],
    references: [user.id],
  }),
  tenant: one(tenant, {
    fields: [invite.tenantId],
    references: [tenant.id],
  }),
}));
