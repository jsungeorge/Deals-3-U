require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Clearing database...");
    await Product.deleteMany({}); // Deletes ALL products
    console.log("All products deleted.");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit();
  });