import { Router } from "express";
import {
  getShortenerPage,
  postURLShortener,
  redirectToShortLink,
  getShortenerEditPage,
  deleteShortCode,
  postShortenerEditPage,
} from "../controllers/postshortener.controller.js";

const router = Router();

router.get("/report", (req, res) => {
  const student = [
    {
      name: "om",
      grade: "10th",
      favSubject: "Math",
    },
    {
      name: "raj",
      grade: "9th",
      favSubject: "English",
    },
    {
      name: "jay",
      grade: "12th",
      favSubject: "Computer",
    },
  ];
  return res.render("report", { student });
});

router.get("/", getShortenerPage);
router.post("/", postURLShortener);
router.get("/:shortCode", redirectToShortLink);

router.route("/edit/:id").get(getShortenerEditPage).post(postShortenerEditPage);
router.route("/delete/:id").post(deleteShortCode);

export const shortenerRoutes = router;
