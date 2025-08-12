import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};

export const createUser = async ({ name, email, password }) => {
  return await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();
};

export const hashPassword = async (password) => {
  return await argon2.hash(password);
};

export const verifyPassword = async (hashPassword, password) => {
  return await argon2.verify(hashPassword, password);
};

export const generateToken = ({ id, name, email }) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  }); // payload, jwt secret key, expires in 1 day
};

export const verifyJWTTOken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
