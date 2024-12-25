const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");

// Use your desired PORT; preserving process.env for flexibility
const PORT = process.env.PORT || 3000;

/**
 * Helper function to serve an HTML file (or any file) to the client.
 */
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
            // If you ever serve an HTML file from /public
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

      default:
        // If no GET route matched
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - Not Found");
        break;
    }

    // --- POST Requests ---
  } else if (req.method === "POST") {
    switch (pathname) {
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
        // If no POST route matched
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
