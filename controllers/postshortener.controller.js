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
    const links = await getAllShortLinks();

    // let isloggedIn = req.headers.cookie;
    // isloggedIn = Boolean(
    //   isloggedIn
    //     ?.split(";")
    //     .find((cookie) => cookie.trim().startsWith("isLoggedIn"))
    //     ?.split("=")[1]
    // );

    let isloggedIn = req.cookies.isLoggedIn;

    return res.render("index", { links, host: req.host, isloggedIn });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    const links = await getShortLinkByShortCode(finalShortCode);

    if (links) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another");
    }

    await insertShortLink({ url, finalShortCode });

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
