const axios = require('axios');
const cheerio = require('cheerio');

const scrapeAmazon = async (url) => {
  try {
    const apiKey = process.env.SCRAPER_API_KEY;
    const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;

    const response = await axios.get(proxyUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('#productTitle').text().trim();

    const priceWhole = $('.a-price-whole').first().text().replace(/[^0-9]/g, '');
    
    const priceFraction = $('.a-price-fraction').first().text().trim();
    const offscreenPrice = $('.a-offscreen').first().text().trim();

    let price = null;
    
    if (priceWhole && priceFraction) {
     
      price = parseFloat(`${priceWhole}.${priceFraction}`);
    } else if (offscreenPrice) {
      price = parseFloat(offscreenPrice.replace(/[^0-9.]/g, ''));
    }

    const image = $('#landingImage').attr('src') || 
                  $('.a-dynamic-image').first().attr('src') ||
                  $('#imgTagWrapperId img').attr('src');

    if (!title || !price) {
      console.log("⚠️ ScraperAPI returned incomplete data.");
      return null;
    }

    return { title, price, image };

  } catch (error) {
    console.error("Scrape Error:", error.message);
    return null;
  }
};

module.exports = scrapeAmazon;