const express = require('express');
const router = express.Router();
const artworksData = require('../data/artwork.json'); // adjust path as needed

// GET /api/artworks?search=... 
// Returns all artworks or filtered artworks based on search query
router.get('/artworks', (req, res) => {
  let { search } = req.query;
  let filteredArtworks = artworksData;

  if (search && search.trim() !== '') {
    search = search.toLowerCase();
    filteredArtworks = artworksData.filter(art =>
      (art.title && art.title.toLowerCase().includes(search)) ||
      (art.author && art.author.toLowerCase().includes(search)) ||
      (art.description && art.description.toLowerCase().includes(search))
    );
  }

  res.json(filteredArtworks);
});

// POST /api/cart/add
// Expects a JSON body with artId and returns a confirmation message
router.post('/cart/add', (req, res) => {
  const { artId } = req.body;
  const art = artworksData.find(a => a.id === artId);
  if (!art) {
    return res.status(404).json({ error: 'Artwork not found' });
  }
  // Here you could update the user session or database; for demo, we return a message.
  res.json({ message: `${art.title} has been added to your cart` });
});

// POST /api/wishlist/toggle
// Expects a JSON body with artId and returns a confirmation message
router.post('/wishlist/toggle', (req, res) => {
  const { artId } = req.body;
  const art = artworksData.find(a => a.id === artId);
  if (!art) {
    return res.status(404).json({ error: 'Artwork not found' });
  }
  // Here you could update the wishlist in session or database; for demo, we return a message.
  res.json({ message: `Wishlist toggled for ${art.title}` });
});


// POST /api/upload-artwork
// Expects a JSON body with artwork details and returns a confirmation message
router.post('/upload-artwork', (req, res) => {
  const { title, description, dimensions, author, location, price, image } = req.body;
  
  // Process the artwork data (validate, save to database, etc.)
  // For example:
  const newArtwork = {
    id: Date.now().toString(), // Generate a unique ID
    title,
    description,
    dimensions,
    author,
    location,
    price: parseFloat(price),
    image
  };
  
  // Add to your data source (this is a simplified example)
  // In a real app, you would save to a database
  artworksData.push(newArtwork);
  
  res.json({ success: true, message: 'Artwork uploaded successfully' });
});

router.get('/cart', (req, res) => {
  res.render('cart'); // Renders views/cart.ejs
});

module.exports = router;