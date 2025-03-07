// Module Instances
const express = require("express");
const path = require("path");
const fs = require("fs");
const errorHandler = require("../middlewares/errorHandler");
const router = express.Router();

// Login Route
router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  fs.readFile(
    path.join(__dirname, "../data/users.json"),
    "utf-8",
    (err, data) => {
      if (err) return next(err);
      const users = JSON.parse(data);
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        res.cookie("username", username, { httpOnly: true });
        res.cookie("isLogged", true, { httpOnly: true });
        return res.status(302).redirect("/dashboard");
      } else {
        return res.status(302).redirect("/register");
      }
    }
  );
});

// Register Route
router.post("/register", (req, res, next) => {
  const { username, password } = req.body;
  const newUser = { username, password };

  fs.readFile(
    path.join(__dirname, "../data/users.json"),
    "utf-8",
    (err, data) => {
      if (err) return next(err);
      let users = [];
      if (data) {
        users = JSON.parse(data);
      }
      users.push(newUser);
      fs.writeFile(
        path.join(__dirname, "../data/users.json"),
        JSON.stringify(users, null, 2),
        (err) => {
          if (err) return next(err);
          res.cookie("username", username, { httpOnly: true });
          res.cookie("isLogged", true, { httpOnly: true });
          res.status(302).redirect("/login");
        }
      );
    }
  );
});

// Logout Route
router.get("/logout", (req, res, next) => {
  res.clearCookie("username");
  res.clearCookie("isLogged");
  res.status(302).redirect("/login")
})

// Upload Artwork Route
router.post("/upload-artwork", (req, res, next) => {
  try {
    const { title, description, dimensions, author, location, price, image } =
      req.body;

    if (
      !title ||
      !description ||
      !dimensions ||
      !author ||
      !location ||
      !price ||
      !image
    ) {
      return errorHandler(new Error("All fields are required"), req, res, next);
    }

    const artworkPath = path.join(__dirname, "../data/artwork.json");

    fs.readFile(artworkPath, "utf8", (err, data) => {
      let artworks = [];
      if (!err && data) {
        try {
          artworks = JSON.parse(data);
        } catch {
          return errorHandler(new Error("Invalid JSON file"), req, res, next);
        }
      }

      const newId = artworks.length ? parseInt(artworks[artworks.length - 1].id) + 1 : 1;

      const newArtwork = {
        id: newId.toString(),
        title,
        description,
        dimensions,
        author,
        location,
        price: parseFloat(price),
        image,
        createdAt: new Date().toISOString(),
      };

      artworks.push(newArtwork);

      fs.writeFile(
        artworkPath,
        JSON.stringify(artworks, null, 2),
        (errWrite) => {
          if (errWrite) {
            return next(errWrite);
          }
          res.status(201).json({
            message: "Artwork uploaded successfully!",
            artwork: newArtwork,
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

// Export the Module
module.exports = router;
