// import { readFile, writeFile } from "fs/promises";
// import { join } from "path";

// const DATA_FILE = join("data", "links.json");

// export const loadLinks = async () => {
//   try {
//     const data = await readFile(DATA_FILE, "utf-8");
//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       // ENOENT means Error NO Entry, i.e if file doesn't exist
//       await writeFile(DATA_FILE, JSON.stringify({}));
//       return {};
//     }
//     throw error;
//   }
// };

// export const saveLinks = async (links) => {
//   await writeFile(DATA_FILE, JSON.stringify(links));
// };

import { dbClient } from "../config/db-client.js";
import { env } from "../config/env.js";

const db = dbClient.db(env.MONGODB_DATABASE_NAME);
const shortenerCollection = db.collection("shorteners");

export const loadLinks = async () => {
  return shortenerCollection.find().toArray();
};

export const saveLinks = async (link) => {
  return shortenerCollection.insertOne(link);
};

export const getLinkByShortCode = async (shortcode) => {
  return await shortenerCollection.findOne({ shortCode: shortcode });
};
