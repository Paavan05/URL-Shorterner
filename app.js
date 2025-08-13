import { shortenerRoutes } from "./routes/shortener.routes.js";
import { join } from "path";
import express from "express";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { verifyAuthentication } from "./middlewares/verify-auth-middleware.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(join(import.meta.dirname, "public"))); // gets all files from public folder
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(cookieParser());

// you set session after storing the cookie
app.use(
  session({ secret: "my-secret", resave: true, saveUninitialized: false })
);
app.use(flash());

app.use(verifyAuthentication);

app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});
// How It Works:
// This middleware runs on every request before reaching the route handlers.
// res.locals is an object that persists throughout the request-response cycle.
// If req.user exists (typically from authentication, like Passport.js), it's stored in res.locals.user.
// Views (like EJS, Pug, or Handlebars) can directly access user without manually passing it in every route.

// This must be after cookieParser middleware.
app.use(authRoutes);
app.use(shortenerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
