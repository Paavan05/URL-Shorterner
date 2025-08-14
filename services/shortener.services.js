import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinksTable } from "../drizzle/schema.js";

export const getAllShortLinks = async (userId) => {
  return await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId));
};

export const getShortLinkByShortCode = async (shortCode) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.shortCode, shortCode));
  return result;
};

export const insertShortLink = async ({ url, finalShortCode, userId }) => {
  await db
    .insert(shortLinksTable)
    .values({ url, shortCode: finalShortCode, userId }); // url : url is same so you can write url one time
};

export const findShortLinkById = async (id) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.id, id));
  return result;
};

export const updateShortLink = async (url, shortCode, id) => {
  return await db
    .update(shortLinksTable)
    .set({url, shortCode})
    .where(eq(shortLinksTable.id, id));
};

export const deleteShortCodeById = async (id) => {
  return await db.delete(shortLinksTable).where(eq(shortLinksTable.id, id));
};
