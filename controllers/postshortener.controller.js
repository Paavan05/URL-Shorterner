import crypto from "crypto";
// import {
//   getLinkByShortCode,
//   loadLinks,
//   saveLinks,
// } from "../models/shortener.model.js";

import {
  getAllShortLinks,
  getShortLinkByShortCode,
  insertShortLink,
} from "../services/shortener.services.js";

export const getShortenerPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const links = await getAllShortLinks(req.user.id);

    return res.render("index", { links, host: req.host });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    const links = await getShortLinkByShortCode(finalShortCode);

    if (links) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another");
    }

    await insertShortLink({ url, finalShortCode, userId: req.user.id });

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const links = await getShortLinkByShortCode(shortCode);

    if (!links) return res.status(404).send("404 error occurred");

    return res.redirect(links.url);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
