import { shortenerRoutes } from "./routes/shortener.routes.js";
import { join } from "path";
import express from "express";

const app = express();

app.use(express.static(join(import.meta.dirname, "public"))); // gets all files from public folder
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(shortenerRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
