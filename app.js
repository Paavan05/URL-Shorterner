import { shortenerRoutes } from "./routes/shortener.routes.js";
import { join } from "path";
import express from "express";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(join(import.meta.dirname, "public"))); // gets all files from public folder
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(authRoutes);
app.use(shortenerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
