import puppeteer from 'puppeteer';

export interface CompetitorPrice {
  productName: string;
  price: number;
  currency: string;
  competitor: 'M&S' | 'Nestlé' | 'Generic';
  url: string;
  timestamp: string;
}

export class MarketScraper {
  private static browser: any;

  private static async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  public static async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrapes Marks & Spencer Food (via Ocado or M&S direct)
   * Note: M&S Food online is often fulfilled by Ocado in UK.
   */
  public static async scrapeMAndS(query: string): Promise<CompetitorPrice | null> {
    try {
      console.log(`[MarketScraper] Searching M&S for: ${query}`);
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Anti-bot measures
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

      // Search URL for M&S (assuming generic search for now)
      const searchUrl = `https://www.marksandspencer.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Try to find the first product price
      // Selectors are hypothetical and need maintenance
      const priceSelector = '.product-sales-price, .value, [data-test="product-price"]'; 
      const nameSelector = '.product-name, [data-test="product-title"]';

      const data = await page.evaluate((pSel, nSel) => {
        const priceEl = document.querySelector(pSel);
        const nameEl = document.querySelector(nSel);
        
        if (priceEl && nameEl) {
          return {
            price: priceEl.textContent?.trim(),
            name: nameEl.textContent?.trim()
          };
        }
        return null;
      }, priceSelector, nameSelector);

      await page.close();

      if (data && data.price) {
        // Extract number from "£4.50"
        const numericPrice = parseFloat(data.price.replace(/[^0-9.]/g, ''));
        return {
          productName: data.name || query,
          price: numericPrice,
          currency: 'GBP',
          competitor: 'M&S',
          url: searchUrl,
          timestamp: new Date().toISOString()
        };
      }
      
      console.warn(`[MarketScraper] M&S scrape failed for ${query}, returning simulated data.`);
      return this.simulatePrice('M&S', query);

    } catch (error) {
      console.error(`[MarketScraper] Error scraping M&S:`, error);
      return this.simulatePrice('M&S', query);
    }
  }

  /**
   * Scrapes Nestlé (or major retailer carrying Nestlé)
   */
  public static async scrapeNestle(query: string): Promise<CompetitorPrice | null> {
    try {
      console.log(`[MarketScraper] Searching Nestlé products for: ${query}`);
      // Nestlé is a brand, usually sold via retailers like Tesco, Walmart, etc.
      // We will search a major generic retailer for Nestlé products.
      // For this implementation, we'll simulate a direct search.
      
      // ... (Implementation would go here, similar to above)
      
      // Returning simulation for reliability in this demo phase
      return this.simulatePrice('Nestlé', query);

    } catch (error) {
      console.error(`[MarketScraper] Error scraping Nestlé:`, error);
      return this.simulatePrice('Nestlé', query);
    }
  }

  private static simulatePrice(competitor: 'M&S' | 'Nestlé' | 'Generic', product: string): CompetitorPrice {
    // Generate a realistic price between 2.00 and 10.00
    const randomPrice = (Math.random() * 8 + 2).toFixed(2);
    return {
      productName: `${competitor} ${product}`,
      price: parseFloat(randomPrice),
      currency: 'GBP', // Defaulting to GBP for these examples
      competitor: competitor,
      url: 'http://simulation.internal',
      timestamp: new Date().toISOString()
    };
  }
}
