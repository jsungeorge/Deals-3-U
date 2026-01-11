const axios = require('axios');
const cheerio = require('cheerio');

const scrapeAmazon = async (url) => {
  try {
    // 1. Fetch the raw HTML (User-Agent is critical to not get blocked)
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      timeout: 10000 // 10 second timeout is plenty for just HTML
    });

    // 2. Load HTML into Cheerio (like jQuery for the server)
    const $ = cheerio.load(data);

    // 3. Extract Data using CSS Selectors
    const title = $('#productTitle').text().trim();
    
    // Amazon stores price in multiple weird ways, let's try them all
    let price = null;
    
    // Strategy A: The "Whole + Fraction" method (Common)
    const priceWhole = $('.a-price-whole').first().text().replace('.', '').trim();
    const priceFraction = $('.a-price-fraction').first().text().trim();
    
    if (priceWhole && priceFraction) {
      price = parseFloat(`${priceWhole}.${priceFraction}`);
    } else {
      // Strategy B: The "Offscreen" hidden price (Books/Kindle)
      const offscreenPrice = $('.a-offscreen').first().text().trim();
      if (offscreenPrice) {
        price = parseFloat(offscreenPrice.replace(/[^0-9.]/g, ''));
      }
    }

    // 4. Extract Image
    // Try the dynamic JS object first, then fallback to img tag
    let image = $('#landingImage').attr('src') || 
                $('#imgTagWrapperId img').attr('src') ||
                $('.a-dynamic-image').first().attr('src');

    // 5. Validation
    if (!title || !price) {
        console.log("⚠️ Scrape Incomplete. Amazon might have served a CAPTCHA page.");
        return null; // Return null to skip updating DB with bad data
    }

    return {
      title,
      price,
      image
    };

  } catch (error) {
    // Handle 503s (Service Unavailable) which usually means "Blocked"
    if (error.response && error.response.status === 503) {
        console.error("❌ Amazon blocked the request (503).");
    } else {
        console.error(`❌ Scrape Error: ${error.message}`);
    }
    return null;
  }
};

module.exports = scrapeAmazon;