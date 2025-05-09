// Module Object Instances
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Models
const User = require("./models/Users");
const Artwork = require("./models/Artworks");
const Event = require("./models/Events");
const Order = require("./models/Orders");

// Load environment variables
dotenv.config();

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/kala-kriti";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// App and Port Setup
const app = express();
const port = process.env.PORT || 9000;

// Logger and Error Handler Middlewares
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const { isAuthenticated, redirectIfAuthenticated } = require('./middlewares/auth');

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const galleryRoutes = require("./routes/gallery");

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/gallery", galleryRoutes);

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

// Get Routes for rendering views or serving static HTML files
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

// Public routes - add redirectIfAuthenticated to prevent authenticated users from accessing login/register
app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login.ejs", { error: req.query.error });
});

app.get("/register", redirectIfAuthenticated, (req, res) => {
  res.render("register.ejs", { error: req.query.error });
});

app.get("/error", (req, res) => {
  errorHandler(new Error("An Error Occurred!"), req, res);
});

// Protected routes
app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render("dashboard", { user: user });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).send("Server error");
  }
});

// app.get('/gallery', (req, res) => {
//   res.render('gallery'); // Renders views/gallery.ejs
// });

app.get("/events", (req, res) => {
  res.render("events.ejs");
});

app.get('/news', (req, res) => {
  res.render('news', { newsApiKey: process.env.NEWS_API_KEY || '9d4d7f3138cc49faa95dde0b3f2ad6d7' });
});

app.get("/artists", (req, res) => {
  res.render("artists.ejs");
});

app.get("/buy", (req, res) => {
  const artworks = require("./data/artwork.json");
  res.render("buy", { artworks });
});

app.get("/sell", isAuthenticated, (req, res) => {
  res.render("sell", { user: req.user });
});

app.get("/cart", isAuthenticated, (req, res) => {
  res.render("cart.ejs", { user: req.user });
});

app.get("/favorites", isAuthenticated, (req, res) => {
  res.render("favorites.ejs", { user: req.user });
});

app.get("/portfolio", isAuthenticated, (req, res) => {
  res.render("portfolio.ejs", { user: req.user });
});

// Handle 404 Errors
app.get("*", (req, res) => {
  res.status(404).render("404", {
      title: "404",
      imagePath: "/art/with-every-kiss.png",
      logoPath: "/logo-color.png",
      year: new Date().getFullYear()
  });
});

// Error Handler Middleware
app.use(errorHandler);

// Start the Server
app.listen(port, () => {
  console.log(`Kala-Kriti Live @ http://localhost:${port}`);
});
