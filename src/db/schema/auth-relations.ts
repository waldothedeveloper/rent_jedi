import { relations } from "drizzle-orm";

import { account, session, twoFactor, user } from "./auth-schema";
import { property } from "./properties-schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  twoFactors: many(twoFactor),
  properties: many(property),
}));
