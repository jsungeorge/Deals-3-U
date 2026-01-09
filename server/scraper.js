const puppeteer = require('puppeteer');

const scrapeAmazon = async (url) => {
  let browser = null;
  try {
    // 1. Launch with Extreme Memory Saving Flags
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // ⚠️ CRITICAL: Prevents memory crashes in Docker/Render
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    });

    const page = await browser.newPage();

    // 2. BLOCK HEAVY RESOURCES (Images, Fonts, CSS)
    // This reduces RAM usage by ~50% because we don't load the pretty stuff
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 3. Go to URL (Increased timeout for safety)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

    // 4. Extract Data
    const data = await page.evaluate(() => {
      const title = document.querySelector('#productTitle')?.innerText.trim();
      
      // Amazon has many price selectors, try them all
      const priceWhole = document.querySelector('.a-price-whole')?.innerText.replace('.', '');
      const priceFraction = document.querySelector('.a-price-fraction')?.innerText;
      
      // Fallback price selectors
      const priceText = document.querySelector('.a-offscreen')?.innerText; 
      
      let finalPrice = 0;

      if (priceWhole && priceFraction) {
        finalPrice = parseFloat(`${priceWhole}.${priceFraction}`);
      } else if (priceText) {
        finalPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      }

      // Grab Image (We blocked loading it, but the URL is still in the HTML!)
      const image = document.querySelector('#landingImage')?.src || 
                    document.querySelector('#imgTagWrapperId img')?.src;

      return { title, price: finalPrice, image };
    });

    return data;

  } catch (error) {
    console.error("Scrape Error:", error.message);
    return null;
  } finally {
    // 5. AGGRESSIVELY CLOSE BROWSER
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = scrapeAmazon;