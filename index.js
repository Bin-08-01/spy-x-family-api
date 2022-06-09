const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const url = "https://spy-x-family.fandom.com/wiki/Category:Characters";
const characterUrl = "https://spy-x-family.fandom.com/wiki/";

//Set up
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
dotenv.config();
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

//Routes

//GET ALL CHARATERS
app.get("/v1", (req, resp) => {
  const thumbnails = [];
  const limit = Number(req.query.limit);
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      $(".category-page__member", html).each(function () {
        const name = $(this).find("a").attr("title");
        const url = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("data-src");
        thumbnails.push({
          name: name,
          url: "https://spy-x-family.onrender.com/v1" + url.split("/wiki")[1],
          image: image,
        });
      });
      if (limit && limit > 0) {
        resp.status(200).json(thumbnails.slice(0, limit));
      } else {
        resp.status(200).json(thumbnails);
      }
    });
  } catch (err) {
    resp.status(500).json(err);
  }
});

//Get a character

app.get("/v1/:character", (req, resp) => {
  let url = characterUrl + req.params.character;
  const titles = [];
  const details = [];
  const characters = [];
  const characterObj = {};
  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);

      //
      $("aside", html).each(function () {
        //Get banner image
        const image = $(this).find("img").attr("src");
        //
        $(this)
          .find("section > div > h3")
          .each(function () {
            titles.push($(this).text());
          });
        //Get character detail
        $(this)
          .find("section > div > div")
          .each(function () {
            details.push($(this).text());
          });

        if (image !== undefined) {
          for (let index = 0; index < titles.length; ++index) {
            characterObj[titles[index].toLowerCase()] = details[index];
          }
          characters.push({
            name: req.params.character.replace("_", " "),
            image: image,
            ...characterObj,
          });
        }
      });
      resp.status(200).json(characters);
    });
  } catch (err) {
    resp.status(500).json(err);
  }
});

//Run port
app.listen(8000, () => {
  console.log("Server is running...");
});
