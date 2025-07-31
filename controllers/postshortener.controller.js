import crypto from "crypto";
// import {
//   getLinkByShortCode,
//   loadLinks,
//   saveLinks,
// } from "../models/shortener.model.js";

import { urls } from "../schema/url_schema.js";

export const getShortenerPage = async (req, res) => {
  try {
    // const links = await loadLinks();
    const links = await urls.find();

    return res.render("index", { links, host: req.host });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    // const links = await loadLinks();
    const links = await urls.find();

    if (links[finalShortCode]) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another");
    }

    // links[finalShortCode] = url;
    // await saveLinks(links);
    // await saveLinks({ url, shortCode });
    await urls.create({ url, shortCode });

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // const links = await getLinkByShortCode(shortCode);
    const links = await urls.findOne({ shortCode: shortCode });

    if (!links) return res.status(404).send("404 error occurred");

    return res.redirect(links.url);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
