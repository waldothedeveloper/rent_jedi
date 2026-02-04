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
import { organization, user } from "./auth-schema";

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

// TODO: WHY IS THE INVITE ROLE ENUM ALSO A MANAGER? IT SHOULD BE ONLY TENANT MOTHER FUCKER
export const inviteRoleEnum = pgEnum("invite_role", ["tenant", "manager"]);

export const invite = pgTable(
  "invite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => property.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .references(() => organization.id, { onDelete: "restrict" }),
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
    index("invite_organization_id_idx").on(table.organizationId),
    index("invite_manager_id_idx").on(table.managerId),
    index("invite_tenant_id_idx").on(table.tenantId),
    index("invite_status_idx").on(table.status),
    uniqueIndex("invite_property_email_uid").on(
      table.propertyId,
      table.inviteeEmail,
    ),
    check(
      "invite_email_valid",
      sql`${table.inviteeEmail} ~ ${sql.raw(`'${EMAILREGEX}'`)}`,
    ),
  ],
);

export const inviteRelations = relations(invite, ({ one }) => ({
  property: one(property, {
    fields: [invite.propertyId],
    references: [property.id],
  }),
  organization: one(organization, {
    fields: [invite.organizationId],
    references: [organization.id],
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
