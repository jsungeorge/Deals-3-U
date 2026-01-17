const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Scraped Data
  title: { type: String, required: true },
  image: { type: String },
  currentPrice: { type: Number, required: true },
  
  // Tracking Details
  url: { type: String, required: true },
  initialPrice: { type: Number, required: true }, 
  targetPrice: { type: Number }, 
  
  targetPercentage: { type: Number, default: 5 },
  notifyOnDrop: { type: Boolean, default: false }, 
  
  dateAdded: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Product', ProductSchema);
