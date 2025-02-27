// Module Object Instances
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

// App and Port Setup
const app = express();
const port = 9000;

// Logger and Error Handler Middlewares
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware Setup
app.use(logger);
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["*"],
      "img-src": ["'self'", "https: data:"],
      "script-src": ['*', "'unsafe-inline'"],
      "script-src-attr": ['*', "'unsafe-inline'"],
    }
  })
)
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const apiRoutes = require("./api/apiRoutes");
app.use("/", apiRoutes);

// Serve Artwork JSON
app.get("/data/artwork.json", (req, res) => {
  const filePath = path.join(__dirname, "data", "artwork.json");
  fs.readFile(filePath, "utf8", (err, fileContents) => {
    if (err) {
      res.status(404).send("File Not Found");
      return;
    }
    res.status(200).json(JSON.parse(fileContents));
  });
});

// Get Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery.html"));
});

app.get("/events", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "events.html"));
});

app.get("/news", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "news.html"));
});

app.get("/artists", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "artists.html"));
});

app.get("/buy", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "buy.html"));
});

app.get("/sell", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "sell.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "cart.html"));
});

app.get("/favorites", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "favorites.html"));
});

app.get("/portfolio", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "portfolio.html"));
});

// Error Handler
app.use(errorHandler);

// 404 Route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// Post Requests
app.post("/upload-artwork", (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const parsedData = JSON.parse(body);
    const { title, description, dimensions, author, location, price, image } = parsedData;
    const newArtwork = {
      title,
      description,
      dimensions,
      author,
      location,
      price: parseFloat(price),
      image,
    };

    const artworkPath = path.join(__dirname, "data", "artwork.json");

    fs.readFile(artworkPath, "utf8", (err, data) => {
      let artworks = [];
      if (!err && data) {
        try {
          artworks = JSON.parse(data);
        } catch {
          console.error("Error parsing artwork.json. Defaulting to an empty array.");
        }
      }

      artworks.push(newArtwork);

      fs.writeFile(artworkPath, JSON.stringify(artworks, null, 2), (errWrite) => {
        if (errWrite) {
          res.status(500).send("Error saving artwork.");
          return;
        }
        res.redirect("/sell");
      });
    });
  });
});

// Start the Server
app.listen(port, () => {
  console.log(`Kala-Kriti Live @ http://localhost:${port}`);
});
