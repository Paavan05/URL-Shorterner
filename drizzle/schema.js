import { relations } from "drizzle-orm";
import { boolean, text, timestamp } from "drizzle-orm/gel-core";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

// re-run the db:generate, db:migrate command whenever you make changes in this file/schema

export const shortLinksTable = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn().notNull(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const sessionsTable = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  ip: varchar({ length: 255 }),
  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn().notNull(),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn().notNull(),
});

// must define relationship manually in drizzle

// A user can have many shortlinks
export const userRelation = relations(usersTable, ({ many }) => ({
  // ({}) because we are returning object
  shortLink: many(shortLinksTable),
  session: many(sessionsTable),
}));

// A short link belongs to a user
export const shorLinksRelation = relations(shortLinksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinksTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));

export const sessionsRelation = relations(sessionsTable, ({ one }) => ({
  user: one(sessionsTable, {
    fields: [sessionsTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));
