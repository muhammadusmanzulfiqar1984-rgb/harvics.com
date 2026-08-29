import { chromium, devices } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();

await page.goto("http://localhost:3020", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

async function navTo(menuText, file) {
  await page.click("#menu-trigger");
  await page.waitForTimeout(800);
  await page.locator(`text=${menuText}`).first().click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: file });
}

await navTo("The Architectural Monolith", "/tmp/tt_m_architecture.png");
await navTo("Suite Configurations", "/tmp/tt_m_configurations.png");

// Amenity tab image check on configurations page
const tab = page.locator("text=Gourmet Food Court").first();
await tab.scrollIntoViewIfNeeded({ timeout: 10000 });
await tab.click();
await page.waitForTimeout(2000);
await page.screenshot({ path: "/tmp/tt_m_amenity.png" });

await browser.close();
console.log("done");
