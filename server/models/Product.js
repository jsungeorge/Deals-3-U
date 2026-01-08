const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Scraped Data
  title: { type: String, required: true },
  image: { type: String },
  currentPrice: { type: Number, required: true },
  
  // Tracking Details
  url: { type: String, required: true },
  initialPrice: { type: Number, required: true }, // Price when they first added it
  targetPrice: { type: Number }, // Optional: "Alert me when it hits $150"
  
  targetPercentage: { type: Number, default: 5 }, // e.g. 5% off
  notifyOnDrop: { type: Boolean, default: false }, // "Send me email"
  
  dateAdded: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Product', ProductSchema);