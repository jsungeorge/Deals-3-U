require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron'); 
const nodemailer = require('nodemailer');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const Product = require('./models/Product');
const scrapeAmazon = require('./scraper');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

  // EMAIL CONFIGURATION
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Set this in .env (e.g., yourname@gmail.com)
    pass: process.env.EMAIL_PASS  // Set this in .env (Use an "App Password"!)
  }
});

const sendAlertEmail = async (userEmail, product) => {
  const mailOptions = {
    from: '"Deals ❤️ U" <noreply@dealshunt.com>',
    to: userEmail,
    subject: `🎉 Price Drop Alert: ${product.title.substring(0, 20)}...`,
    html: `
      <h2>Good News!</h2>
      <p>The price for <strong>${product.title}</strong> has dropped!</p>
      <p><strong>New Price:</strong> $${product.currentPrice}</p>
      <p><a href="${product.url}">Buy it now on Amazon</a></p>
      <p> - Jiashu's Deal Tracker</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
};

cron.schedule('0 * * * *', async () => {
  // ... (Log start) ...
  try {
    // We need to 'populate' user info to get their email address
    const products = await Product.find({}).populate('user');
    
    for (const product of products) {
       // ... (Delay & Scrape logic) ...
       
       if (freshData && freshData.price > 0 && freshData.price !== product.currentPrice) {
          product.currentPrice = freshData.price;
          
          const target = product.initialPrice * (1 - product.targetPercentage/100);
          
          // CHECK IF DEAL & NOTIFY
          if (product.currentPrice <= target) {
             console.log(`🎉 DEAL! Sending email to ${product.user.email}`);
             if (product.notifyOnDrop) {
                await sendAlertEmail(product.user.email, product);
             }
          }
          await product.save();
       }
    }
  } catch (err) { console.error(err); }
});

// ==========================================
// ROUTES
// ==========================================

app.post('/api/products/preview', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });
  try {
    const data = await scrapeAmazon(url);
    if (!data) return res.status(500).json({ error: "Product lookup failed. Amazon may be blocking requests." });
    res.json(data);
  } catch (err) {
    console.error("PREVIEW ERROR:", err);

    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/add', async (req, res) => {
  try {
    const { userId, url, title, image, price, targetPercentage, notifyOnDrop } = req.body;
    const product = new Product({
      user: userId, url, title, image,
      currentPrice: price, initialPrice: price,
      targetPercentage, notifyOnDrop
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/user/:userId', async (req, res) => {
  try {
    const products = await Product.find({ user: req.params.userId }).sort({ dateAdded: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Keep simulate for testing if you want, or remove if you want 100% purity.
// Keeping it is harmless and helpful for verification.
app.patch('/api/products/simulate-drop/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.currentPrice = product.initialPrice * 0.5;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const path = require('path');

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Automated Server running on port ${PORT}`));