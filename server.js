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

// Middleware Setup
app.use(logger);
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["*"],
      "img-src": ["'self'", "https: data:"],
      "script-src": ["*", "'unsafe-inline'"],
      "script-src-attr": ["*", "'unsafe-inline'"],
    },
  })
);
app.use(cookieParser());
app.use(bodyParser.json()); // For JSON Payloads
app.use(bodyParser.urlencoded({ extended: true })); // For Form Submission URL-Encoded Payloads 

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const apiRoutes = require("./api/apiRoutes");
app.use("/api", apiRoutes);

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
  
  const isLogged = req.cookies.isLogged;
  if (isLogged === 'true') {
    return res.redirect("/dashboard");
  }

  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/error", (req, res) => {
  errorHandler(new Error("An Error Occurred!"), req, res);
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

// Handle 404 Errors
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// Error Handler
app.use(errorHandler);

// Start the Server
app.listen(port, () => {
  console.log(`Kala-Kriti Live @ http://localhost:${port}`);
});
