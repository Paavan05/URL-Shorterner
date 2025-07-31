import { shortenerRoutes } from "./routes/shortener.routes.js";
import { join } from "path";
import express from "express";
import { connectDB } from "./config/db-client.js";
import { env } from "./config/env.js";

const app = express();

app.use(express.static(join(import.meta.dirname, "public"))); // gets all files from public folder
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(shortenerRoutes);

try {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
} catch (error) {
  console.error(error);
}
