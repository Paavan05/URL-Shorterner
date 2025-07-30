import crypto from "crypto";
import {
  getLinkByShortCode,
  loadLinks,
  saveLinks,
} from "../models/shortener.model.js";
import { readFile } from "fs/promises";
import { join } from "path";

export const getShortenerPage = async (req, res) => {
  try {
    // const file = await readFile(join("views", "index.html"));
    const links = await loadLinks();

    // const content = file.toString().replaceAll(
    //   "{{ shortened_urls }}",
    //   Object.entries(links)
    //     .map(([shortCode, url]) => {
    //       const truncatedURL =
    //         url.length >= 30 ? `${url.slice(0, 30)}...` : url;
    //       return `<li>${truncatedURL} -> <a href="/${shortCode}" target="_blank">${req.host}/${shortCode}</a></li>`;
    //     })
    //     .join("")
    // );
    // return res.send(content);

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

    const links = await loadLinks();

    if (links[finalShortCode]) {
      return res
        .status(400)
        .send("Short code already exists. Please choose another");
    }

    // links[finalShortCode] = url;
    // await saveLinks(links);
    await saveLinks({ url, shortCode });

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // const links = await loadLinks();
    const links = await getLinkByShortCode(shortCode);

    // if (!links[shortCode]) return res.status(404).send("404 error occurred");
    if (!links) return res.status(404).send("404 error occurred");

    return res.redirect(links.url);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};
