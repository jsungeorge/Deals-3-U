const axios = require('axios');
const cheerio = require('cheerio');

const scrapeAmazon = async (url) => {
  try {
    const apiKey = process.env.SCRAPER_API_KEY;
    // render=true is CRITICAL for some prices that load via JS
    const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;

    const response = await axios.get(proxyUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    // 1. Get Title
    const title = $('#productTitle').text().trim();

    // 2. THE NUCLEAR PRICE FINDER
    // We try all these selectors in order. The first one that works wins.
    const priceSelectors = [
      '.a-price .a-offscreen',                // Standard (Hidden accessible price)
      '#corePrice_feature_div .a-offscreen',  // New standard layout
      '#corePriceDisplay_desktop_feature_div .a-offscreen', // Desktop specific
      '#priceblock_ourprice',                 // Old standard
      '#priceblock_dealprice',                // Deal pages
      '.a-price-whole',                       // Last resort (Whole number only)
      '#price_inside_buybox'                  // Buybox price
    ];

    let price = null;

    for (const selector of priceSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Clean the text: Remove currency symbols ($), commas (,), and whitespace
        const rawText = element.text().trim();
        const cleanText = rawText.replace(/[^0-9.]/g, ''); 
        
        if (cleanText) {
          price = parseFloat(cleanText);
          console.log(`✅ Found price using selector: "${selector}" -> ${price}`);
          break; // Stop looking once we find it
        }
      }
    }

    // 3. Get Image
    const image = $('#landingImage').attr('src') || 
                  $('.a-dynamic-image').first().attr('src') ||
                  $('#imgTagWrapperId img').attr('src') ||
                  $('.imgTagWrapper img').attr('src');

    // 4. Final Validation
    if (!title || !price) {
      console.log("⚠️ Scrape Incomplete. Title or Price missing.");
      console.log(`   Title found: ${!!title}`);
      console.log(`   Price found: ${!!price}`);
      return null;
    }

    return { title, price, image };

  } catch (error) {
    console.error("Scrape Error:", error.message);
    return null;
  }
};

module.exports = scrapeAmazon;