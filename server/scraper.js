const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

let browserInstance = null;

async function getBrowser() {
  // If browser exists and is connected, reuse it
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // Otherwise, launch a new one (This happens only once on startup)
  console.log("Launching new browser instance...");
  browserInstance = await puppeteer.launch({ 
    headless: "new", 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--window-size=1920,1080',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  });
  return browserInstance;
}

async function scrapeAmazon(url) {
  let page = null;
  try {
    const browser = await getBrowser();
    
    // Create a new tab within the existing browser
    page = await browser.newPage();
    
    // 1. MASK AS REAL USER
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
    });

    // 2. GO TO PAGE (Optimized timeout)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

    // 3. EXTRACT DATA
    const data = await page.evaluate(() => {
      const getText = (s) => document.querySelector(s)?.innerText.trim() || null;
      const getAttr = (s, a) => document.querySelector(s)?.getAttribute(a) || null;

      const title = getText('#productTitle') || getText('#title') || "Unknown Product";
      
      const image = getAttr('#landingImage', 'src') || 
                    getAttr('#imgBlkFront', 'src') || 
                    getAttr('.a-dynamic-image', 'src') ||
                    "https://placehold.co/400";

      let rawPrice = getText('.a-price .a-offscreen') || 
                     getText('#price_inside_buybox') ||
                     getText('.apexPriceToPay .a-offscreen');
      
      if (!rawPrice) {
        const whole = getText('.a-price-whole');
        const fraction = getText('.a-price-fraction');
        if (whole) rawPrice = whole + '.' + (fraction || '00');
      }

      const cleanPrice = rawPrice ? rawPrice.replace(/[^\d.]/g, '') : "0";

      return { title, image, price: parseFloat(cleanPrice) };
    });

    // Only close the TAB, not the BROWSER
    await page.close();

    if (data.title === "Unknown Product") return null;

    return {
      ...data,
      url,
      formattedPrice: data.price.toFixed(2)
    };

  } catch (err) {
    console.error("Scrape failed:", err.message);
    // If the page crashed, try to close it to free memory
    if (page) await page.close().catch(() => {});
    return null;
  }
}

module.exports = scrapeAmazon;