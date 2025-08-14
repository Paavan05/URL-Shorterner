import crypto from "crypto";
// import {
//   getLinkByShortCode,
//   loadLinks,
//   saveLinks,
// } from "../models/shortener.model.js";

import {
  deleteShortCodeById,
  findShortLinkById,
  getAllShortLinks,
  getShortLinkByShortCode,
  insertShortLink,
  updateShortLink,
} from "../services/shortener.services.js";
import { shortenerSchema } from "../validators/shortener-validator.js";
import z from "zod";

export const getShortenerPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const links = await getAllShortLinks(req.user.id);

    return res.render("index", {
      links,
      host: req.host,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { data, error } = shortenerSchema.safeParse(req.body);
    if (error) {
      const errorMessage = error.errors.map((err) => err.message);
      req.flash("errors", errorMessage);
      return res.redirect("/");
    }
    const { url, shortCode } = data;
    // const { url, shortCode } = req.body;

    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

    const links = await getShortLinkByShortCode(finalShortCode);

    if (links) {
      // return res
      //   .status(400)
      //   .send("Short code already exists. Please choose another");

      req.flash(
        "errors",
        "Url with that shortcode already exists, please choose another"
      );
      return res.redirect("/");
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

export const getShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  // const id = req.params;
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) return res.send("404 error");

  try {
    const shortLink = await findShortLinkById(id);
    if (!shortLink) return res.send("404 error");

    res.render("edit-shortLink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const postShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { data: id, err } = z.coerce.number().int().safeParse(req.params.id);
  if (err) return res.send("404 error");

  try {
    const { data, error } = shortenerSchema.safeParse(req.body);
    if (error) {
      const errorMessage = error.errors.map((err) => err.message);
      req.flash("errors", errorMessage);
      return res.redirect(`/edit/${id}`);
    }
    const { url, shortCode } = data;

    await updateShortLink(url, shortCode, id);

    return res.redirect("/")
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const deleteShortCode = async (req, res) => {
  try {
    const { data: id, error } = z.coerce
      .number()
      .int()
      .safeParse(req.params.id);
    if (error) return res.send("404 error");

    await deleteShortCodeById(id);
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
