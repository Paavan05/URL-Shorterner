import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  sessionsTable,
  shortLinksTable,
  usersTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import crypto from "crypto";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { sendEmail } from "../lib/send-email.js";
import path from "path";
import fs from "fs/promises";
import mjml2html from "mjml";
import ejs from "ejs";

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
    .values({ name, email, password }) // pass values inside {}
    .$returningId();
};

export const hashPassword = async (password) => {
  return await argon2.hash(password);
};

export const verifyPassword = async (hashPassword, password) => {
  return await argon2.verify(hashPassword, password);
};

// export const generateToken = ({ id, name, email }) => {
//   return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   }); // payload, jwt secret key, expires in 1 day
// };

export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .$returningId();

  return session;
};

export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, //   expiresIn: "15m",
  });
};
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND, // expiresIn: "1w"
  });
};

export const verifyJWTTOken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  return session;
};

export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user;
};

export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTTOken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid Session");
    }

    const user = await findUserById(currentSession.userId);
    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };

    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);

    return { newAccessToken, newRefreshToken, user: userInfo };
  } catch (error) {
    console.log(error.message);
  }
};

export const clearUserSession = async (sessionId) => {
  return await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
};

export const authenticateUser = async ({ req, res, user, name, email }) => {
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };
  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

export const getAllShortLinks = async (userId) => {
  return await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId));
};

export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;

  return crypto.randomInt(min, max).toString();
};

export const insertVerifyEmailToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    // tx stands for transaction, either fully complete or rollback to previous state
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`)); // deletes all the expired tokens

      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId)); // deletes any existing tokens for this specific user i.e if user created the token but didn't verify it

      await tx.insert(verifyEmailTokensTable).values({ userId, token }); // Insert the new token
    } catch (error) {
      console.log("failed to insert verification token: ", error);
    }
  });
};

// export const createVerifyEmailLink = async ({ email, token }) => {
//   const uriEncodedEmail = encodeURIComponent(email);
//   return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;
// };

export const createVerifyEmailLink = async ({ email, token }) => {
  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);

  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};
// The URL API in JavaScript provides an easy way to construct, manipulate, and parse URLs without manual string concatenation. It ensures correct encoding, readability, and security when handling URLs.

// const url = new URL("https://example.com/profile?id=42&theme=dark");

// console.log(url.hostname); // "example.com"
// console.log(url.pathname); // "/profile"
// console.log(url.searchParams.get("id")); // "42"
// console.log(url.searchParams.get("theme")); // "dark"

// Why Use the URL API?
// Easier URL Construction – No need for manual ? and & handling.
// Automatic Encoding – Prevents issues with special characters.
// Better Readability – Clean and maintainable code.

export const findVerificationEmailToken = async ({ token, email }) => {
  return await db
    // .select({key: table.column})
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
        eq(usersTable.email, email)
      )
    )
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
};

export const verifyUserEmailAndUpdate = async (email) => {
  return await db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

export const clearVerifyEmailToken = async (userId) => {
  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, userId));
};

export const sendNewVerifyEmailLink = async ({ email, userId }) => {
  const randomToken = generateRandomToken();

  await insertVerifyEmailToken({ userId, token: randomToken });

  const verifyEmailLink = await createVerifyEmailLink({
    email,
    token: randomToken,
  });

  // get the file data of verify-email.mjml mjml is used for email Templates to make it look good
  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "verify-email.mjml"),
    "utf-8"
  );

  // replace the placeholders with actual values
  const filledTemplate = ejs.render(mjmlTemplate, {
    code: randomToken,
    link: verifyEmailLink,
  });

  // convert mjml to html
  const htmlOutput = mjml2html(filledTemplate).html;

  sendEmail({
    to: email,
    subject: "Verify your email",
    html: htmlOutput,
  }).catch(console.error);
};
