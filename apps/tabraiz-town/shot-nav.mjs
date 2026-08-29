import { chromium, devices } from "playwright";

const browser = await chromium.launch();

for (const w of [1440, 1024]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto("http://localhost:3020", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `/tmp/tt_nav_${w}.png`, clip: { x: 0, y: 0, width: w, height: 70 } });
  await page.close();
}

const page = await browser.newPage({ ...devices["iPhone 13"] });
await page.goto("http://localhost:3020", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "/tmp/tt_m_home.png" });

await browser.close();
console.log("done");
