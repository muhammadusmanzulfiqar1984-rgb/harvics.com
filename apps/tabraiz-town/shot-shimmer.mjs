import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3020", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "/tmp/tt_shimmer_1.png" });
await page.waitForTimeout(2200);
await page.screenshot({ path: "/tmp/tt_shimmer_2.png" });
await browser.close();
console.log("done");
