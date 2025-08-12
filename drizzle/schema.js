import { timestamp } from "drizzle-orm/gel-core";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

// re-run the db:generate, db: migrate command whenever you make changes in this file/schema

export const shortLinksTable = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
});

export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdateFn().notNull(),
});
