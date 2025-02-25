const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");

const PORT = 3000;

const serveFile = (filePath, contentType, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Page Not Found");
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}; 

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- GET Requests ---
  if (req.method === "GET") {
    // 1) Serve static files from /public if path starts with "/public/"
    if (pathname.startsWith("/public/")) {
      const filePath = path.join(__dirname, pathname);

      // Read file in "binary" form if it's non-HTML (images, CSS, JS, etc.)
      fs.readFile(filePath, (err, fileData) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("File Not Found");
        }

        // Determine content type based on extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = "application/octet-stream"; // default fallback

        switch (ext) {
          case ".css":
            contentType = "text/css";
            break;
          case ".js":
            contentType = "application/javascript";
            break;
          case ".png":
            contentType = "image/png";
            break;
          case ".jpg":
          case ".jpeg":
            contentType = "image/jpeg";
            break;
          case ".gif":
            contentType = "image/gif";
            break;
          case ".html":
            contentType = "text/html";
            break;
          // add other content types as needed
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(fileData);
      });
      return; // ensure we don't fall through to the switch below
    }

    if (pathname === "/data/artwork.json") {
      const filePath = path.join(__dirname, "data", "artwork.json");

      fs.readFile(filePath, "utf8", (err, fileContents) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("File Not Found");
        }
        // Return file as JSON
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(fileContents);
      });
      return;
    }

    // 2) Otherwise, handle your normal GET routes
    switch (pathname) {
      case "/":
        // Serve the home page (index.html)
        serveFile(
          path.join(__dirname, "views", "index.html"),
          "text/html",
          res
        );
        break;

      case "/contact":
        // Serve the contact page
        serveFile(
          path.join(__dirname, "views", "contact.html"),
          "text/html",
          res
        );
        break;

      case "/login":
        // Serve the login page
        serveFile(
          path.join(__dirname, "views", "login.html"),
          "text/html",
          res
        );
        break;

      case "/register":
        // Serve the register page
        serveFile(
          path.join(__dirname, "views", "register.html"),
          "text/html",
          res
        );
        break;

      case "/dashboard":
        // Serve the dashboard page
        serveFile(
          path.join(__dirname, "views", "dashboard.html"),
          "text/html",
          res
        );
        break;

      case "/gallery":
        // Serve the gallery page
        serveFile(
          path.join(__dirname, "views", "gallery.html"),
          "text/html",
          res
        );
        break;
      
      case "/events":
        // Serve the events page
        serveFile(
          path.join(__dirname, "views", "events.html"),
          "text/html",
          res
        );
        break;
      
      case "/news":
        // Serve the news page
        serveFile(
          path.join(__dirname, "views", "news.html"),
          "text/html",
          res
        );
        break;
      
      case "/artists":
        // Serve the artists page
        serveFile(
          path.join(__dirname, "views", "artists.html"),
          "text/html",
          res
        );
        break;

      case "/buy":
        // Serve the buy page
        serveFile(
          path.join(__dirname, "views", "buy.html"),
          "text/html",
          res
        );
        break;

      case "/sell":
        // Serve the sell page
        serveFile(
          path.join(__dirname, "views", "sell.html"),
          "text/html",
          res
        );
        break;

      case "/cart":
        // Serve the cart page
        serveFile(
          path.join(__dirname, "views", "cart.html"),
          "text/html",
          res
        );
        break;

      case "/favorites":
        // Serve the favorites page
        serveFile(
          path.join(__dirname, "views", "favorites.html"),
          "text/html",
          res
        );
        break;
      
      case "/portfolio":
        // Serve the portfolio page
        serveFile(
          path.join(__dirname, "views", "portfolio.html"),
          "text/html",
          res
        );
        break;

      default:
        // If no GET route matched
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - Not Found");
        break;
    }

    // --- POST Requests ---
  } else if (req.method === "POST") {
    switch (pathname) {
      // Artwork Upload
      case "/upload-artwork": {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          const parsedData = querystring.parse(body);
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
                res.writeHead(500, { "Content-Type": "text/plain" });
                return res.end("Error saving artwork.");
              }
              res.writeHead(302, { Location: "/sell" });
              res.end();
            });
          });
        });
        break;
      }

      /**
       * LOGIN
       */
      case "/login": {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          const { username, password } = querystring.parse(body);
          const usersPath = path.join(__dirname, "data", "users.json");

          fs.readFile(usersPath, "utf8", (err, data) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              return res.end("Server error reading users.json");
            }

            let users = [];
            try {
              users = JSON.parse(data);
            } catch (parseErr) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              return res.end("Error parsing users.json");
            }

            // Validate user
            const user = users.find((u) => u.username === username);
            if (!user) {
              // If user not found, redirect to register
              res.writeHead(302, { Location: "/register" });
              return res.end();
            }

            // If password is incorrect
            if (password !== user.password) {
              res.writeHead(401, { "Content-Type": "text/plain" });
              return res.end("Invalid credentials (wrong password)");
            }

            // If successful, redirect to dashboard
            // localStorage.setItem("username", username);
            res.writeHead(302, { Location: "/dashboard" });
            res.end();
          });
        });
        break;
      }

      /**
       * REGISTER
       */
      case "/register": {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          const { username, password } = querystring.parse(body);
          const usersPath = path.join(__dirname, "data", "users.json");

          fs.readFile(usersPath, "utf8", (err, data) => {
            // On read error, we still allow writing new data (like original logic)
            let users = [];
            if (!err) {
              try {
                users = JSON.parse(data);
              } catch (parseErr) {
                // If file is empty or invalid JSON, assume empty array
                users = [];
              }
            }

            // Check if user already exists
            const existing = users.find((u) => u.username === username);
            if (existing) {
              res.writeHead(400, { "Content-Type": "text/plain" });
              return res.end("Username already taken");
            }

            // Add new user
            users.push({ username, password });
            fs.writeFile(
              usersPath,
              JSON.stringify(users, null, 2),
              (errWrite) => {
                if (errWrite) {
                  res.writeHead(500, { "Content-Type": "text/plain" });
                  return res.end("Error writing to users.json");
                }
                // Success: redirect to /login
                res.writeHead(302, { Location: "/login" });
                res.end();
              }
            );
          });
        });
        break;
      }

      default:
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - Not Found");
        break;
    }

    // --- Anything else (e.g. PUT/DELETE) => 404 ---
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
