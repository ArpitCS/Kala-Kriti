// Module Instances
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Login Route
router.post('/login', (req, res, next) => {
    const {username, password} = req.body;

    fs.readFile(path.join(__dirname, '../data/users.json'), 'utf-8', (err, data) => {
        if (err) return next(err);
        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            return res.status(302).redirect('/dashboard');
        } else {
            return res.status(302).redirect('/register');
        }
    });
})

// Register Route
router.post('/register', (req, res, next) => {
    const {username, password} = req.body;
    const newUser = {username, password};

    fs.readFile(path.join(__dirname, '../data/users.json'), 'utf-8', (err, data) => {
        if (err) return next(err);
        let users = [];
        if (data) {
            users = JSON.parse(data);
        }
        users.push(newUser);
        fs.writeFile(path.join(__dirname, '../data/users.json'), JSON.stringify(users, null, 2), (err) => {
            if (err) return next(err);
            res.status(302).redirect('/login');
        });
    });
})

// Art Upload Route
// router.post('/upload-artwork', (req, res, next) => {
//     let body = "";
//     req.on("data", (chunk) => (body += chunk));
//     req.on("end", () => {
//         const parsedData = JSON.parse(body);
//         const { title, description, dimensions, author, location, price, image } = parsedData;
//         const newArtwork = {
//             title,
//             description,
//             dimensions,
//             author,
//             location,
//             price: parseFloat(price),
//             image,
//         };

//         const artworkPath = path.join(__dirname, '../data/artwork.json');

//         fs.readFile(artworkPath, "utf8", (err, data) => {
//             let artworks = [];
//             if (!err && data) {
//                 try {
//                     artworks = JSON.parse(data);
//                 } catch {
//                     console.error("Error parsing artwork.json. Defaulting to an empty array.");
//                 }
//             }

//             artworks.push(newArtwork);

//             fs.writeFile(artworkPath, JSON.stringify(artworks, null, 2), (errWrite) => {
//                 if (errWrite) {
//                     return next(errWrite);
//                 }
//                 res.status(302).redirect('/sell');
//             });
//         });
//     });
// });

// Export the Module
module.exports = router;