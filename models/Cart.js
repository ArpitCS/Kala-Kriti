const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Cart expires after 7 days
  }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;