const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['painting', 'sculpture', 'photography', 'digital', 'mixed-media', 'other']
  },
  images: [{
    type: String,
    required: true
  }],
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'mm'],
      default: 'cm'
    }
  },
  medium: String,
  year: Number,
  available: {
    type: Boolean,
    default: true
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add any middleware or static methods here if needed
// For example:
// artworkSchema.pre('save', function(next) {
//   // do something before saving
//   next();
// });

// Define and export the model correctly
const Artwork = mongoose.model("Artwork", artworkSchema);
module.exports = Artwork;