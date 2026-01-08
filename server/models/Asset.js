const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 1 },
  available: { type: Number, default: 1 },
  description: { type: String, default: "No description available." },
  image: { type: String, default: "https://placehold.co/400?text=No+Image" }
});

module.exports = mongoose.model('Asset', assetSchema);