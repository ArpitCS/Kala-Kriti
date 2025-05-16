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
const artworksRoutes = require("./routes/artworks");

// Models
const User = require("./models/Users");
const Artwork = require("./models/Artworks");
const Event = require("./models/Events");
const Order = require("./models/Orders");

// Load environment variables
dotenv.config();

// MongoDB Connection
const connectDB = require("./config/db");
connectDB();

// App and Port Setup
const app = express();
const port = process.env.PORT || 3000;

// Logger and Error Handler Middlewares
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const {
  isAuthenticated,
  redirectIfAuthenticated,
} = require("./middlewares/auth");

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.locals.rmWhitespace = true; // Remove whitespace
app.locals.outputFunctionName = "echo"; // Custom output function name

// Middleware Setup
app.use(logger);
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    dnsPrefetchControl: false,
    expectCt: false,
    frameguard: false,
    hidePoweredBy: false,
    hsts: false,
    ieNoOpen: false,
    noSniff: false,
    originAgentCluster: false,
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
    xssFilter: false
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// API Routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const galleryRoutes = require("./routes/gallery");
const wishlistRoutes = require("./routes/wishlist");
const checkoutRoutes = require("./routes/checkout");
const eventsRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const newsRoutes = require("./routes/news");

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/gallery", galleryRoutes);
app.use("/artworks", artworksRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/events", eventsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);

// Get Routes for rendering views or serving static HTML files
app.get("/", (req, res) => {
  const token = req.cookies.token;

  if (token) {
    res.redirect("/homepage");
  } else {
    res.redirect("/login");
  }
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

// Public routes
app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login.ejs", { error: req.query.error });
});

app.get("/register", redirectIfAuthenticated, (req, res) => {
  res.render("register.ejs", { error: req.query.error });
});

app.get("/error", (req, res) => {
  res.render("error.ejs", { error: "An Error Occurred!" });
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

app.get("/admin", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res
        .status(403)
        .redirect("/error?message=Access denied. Admin privileges required.");
    }

    // Get initial counts for dashboard
    const [userCount, artworkCount, eventCount, orderCount] = await Promise.all(
      [
        User.countDocuments(),
        Artwork.countDocuments(),
        Event.countDocuments(),
        Order.countDocuments(),
      ]
    );

    res.render("admin.ejs", {
      user: user,
      counts: {
        users: userCount,
        artworks: artworkCount,
        events: eventCount,
        orders: orderCount,
      },
    });
  } catch (err) {
    console.error("Error accessing admin page:", err);
    res.status(500).redirect("/error?message=Server error");
  }
});

app.get("/artists", isAuthenticated, (req, res) => {
  res.render("artists.ejs");
});

app.get("/buy", isAuthenticated,(req, res) => {
  res.redirect("/artworks");
});

app.get("/sell", isAuthenticated, (req, res) => {
  res.render("sell", { user: req.user });
});

app.get("/cart", isAuthenticated, (req, res) => {
  res.render("cart.ejs");
});

app.get("/news", isAuthenticated,(req, res) => {
  res.render("news.ejs");
});

app.get("/wishlist", isAuthenticated, (req, res) => {
  res.redirect("/wishlist/");
});

app.get("/portfolio", isAuthenticated, (req, res) => {
  res.render("portfolio.ejs", { user: req.user });
});

app.get("/homepage", isAuthenticated, (req, res) => {
  res.render("index.ejs", { user: req.user });
});

// Handle 404 Errors
app.get("*", (req, res) => {
  res.status(404).render("404", {
    title: "404",
    imagePath: "/art/with-every-kiss.png",
    logoPath: "/logo-color.png",
    year: new Date().getFullYear(),
  });
});

// Error Handler Middleware
app.use(errorHandler);

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Kala-Kriti Live @ http://localhost:${port}`);
  });
}

