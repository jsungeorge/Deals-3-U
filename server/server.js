if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const ScanLog = require('./models/ScanLog');
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
const sendAlertEmail = async (userEmail, product) => {
  console.log(`Attempting to email ${userEmail}...`);

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { 
          name: "Deals ❤️ U", 
          email: "dealsloveu@gmail.com" 
        },
        to: [{ email: userEmail }],
        subject: `🎉 Price Drop Alert: ${product.title.substring(0, 20)}...`,
        htmlContent: `
          <h2>Good News!</h2>
          <p>The price for <strong>${product.title}</strong> has dropped!</p>
          <p><strong>New Price:</strong> $${product.currentPrice}</p>
          <p><a href="${product.url}">Buy it now on Amazon</a></p>
          <br/>
          <p> - Jiashu's Deal Tracker</p>
        `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
          'accept': 'application/json'
        }
      }
    );

    console.log(`✅ Email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("❌ Email failed:", error.response?.data || error.message);
  }
};

const runBatchScan = async (source = "Automated") => {
  console.log(`Starting Batch Scan (Source: ${source})...`);
  const start = Date.now();
  let emailsSentCount = 0;
  let productsScannedCount = 0;

  try {
    const products = await Product.find({}).populate('user');
    productsScannedCount = products.length;
    console.log(`🔎 Found ${products.length} products. Processing in batches...`);


    const BATCH_SIZE = 1;;
    
    // Helper function to process a single product
    const processProduct = async (product) => {
      try {
        const freshData = await scrapeAmazon(product.url);
        if (!freshData || freshData.price <= 0) return;

        if (freshData.price !== product.currentPrice) {
          product.currentPrice = freshData.price;
          const target = product.initialPrice * (1 - product.targetPercentage / 100);
          
          if (product.currentPrice <= target) {
            console.log(`🎉 DEAL: ${product.title.substring(0, 15)}`);
            if (product.notifyOnDrop) {
              await sendAlertEmail(product.user.email, product);
              emailsSentCount++;
            }
          }
          await product.save();
        }
      } catch (innerErr) {
        console.error(`⚠️ Error processing ${product.title}:`, innerErr.message);
      }
    };

    // THE BATCH LOOP
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`...Processing items ${i + 1} to ${i + batch.length}...`);
      
      // Run these 2 items in PARALLEL
      await Promise.all(batch.map(product => processProduct(product)));
      
      // Small cooldown between batches
      if (i + BATCH_SIZE < products.length) {
         await new Promise(r => setTimeout(r, 2000));
      }
    }

    const duration = Date.now() - start;
    await ScanLog.create({
      status: 'Success',
      productsScanned: productsScannedCount,
      emailsSent: emailsSentCount,
      durationMs: duration,
      triggerSource: source
    });
    console.log(`✅ Scan Complete. Duration: ${duration / 1000}s`);

  } catch (err) {
    console.error("❌ Scan Failed:", err);
    await ScanLog.create({
      status: 'Failed',
      error: err.message,
      triggerSource: source
    });
  }
};

// ==========================================
// ⚡ SECURE TRIGGER ENDPOINT
// ==========================================
app.post('/api/cron/scan', async (req, res) => {
  const CRON_SECRET = process.env.CRON_SECRET; 
  
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    console.log("🔒 Unauthorized scan attempt blocked.");
    return res.status(401).json({ error: "Unauthorized" });
  }

  runBatchScan("GitHub Action").catch(console.error);
  
  res.json({ message: "Scan triggered successfully", timestamp: new Date() });
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
