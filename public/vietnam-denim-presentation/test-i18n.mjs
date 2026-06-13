import puppeteer from 'puppeteer';

const URL = process.env.DECK_URL || 'http://localhost:5560/';
const VI_TAGLINE = 'Kiến trúc Thương mại Chủ quyền EU & Châu Mỹ';
const EN_TAGLINE = 'Sovereign EU & Americas Trade Architecture';

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getHeroTagline(page) {
  return page.evaluate(() => {
    const el = document.querySelector('#hero .hero-tagline');
    return el?.textContent?.trim() || '';
  });
}

async function clickEnDoors(page) {
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('.lang-switch-doors .lang-btn')];
    const en = buttons.find((b) => b.textContent.trim() === 'EN');
    en?.click();
  });
}

async function openBrief(page) {
  await page.waitForSelector('.enter-button', { visible: true });
  await page.evaluate(() => {
    const btn = document.querySelector('.enter-button');
    btn?.click();
  });
  await page.waitForFunction(
    () => window.location.search.includes('entered=1'),
    { timeout: 20000 }
  );
  await page.waitForFunction(() => {
    const el = document.querySelector('#hero .hero-tagline');
    return el && el.textContent.trim().length > 0;
  }, { timeout: 10000 });
}

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.setItem('genviet-locale', 'vi');
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('.lang-switch-doors', { timeout: 10000 });
  await wait(300);

  await clickEnDoors(page);
  await wait(300);

  await openBrief(page);
  await page.waitForFunction(() => {
    const el = document.querySelector('#hero .hero-tagline');
    return el && el.textContent.trim().length > 0;
  }, { timeout: 10000 });
  await wait(400);

  const heroAfter = await getHeroTagline(page);
  const navAbout = await page.evaluate(() => {
    return document.querySelector('.nav-link[href="#about"]')?.textContent?.trim() || '';
  });
  const hasNavLang = await page.evaluate(() => {
    return document.querySelectorAll('.nav-links ~ .lang-switch, .nav-right .lang-switch').length;
  });

  console.log(JSON.stringify({
    heroAfter,
    navAbout,
    hasNavLang,
    url: page.url(),
    pass:
      heroAfter.includes(EN_TAGLINE) &&
      navAbout === 'About' &&
      hasNavLang === 0,
  }, null, 2));
} catch (err) {
  console.error('TEST FAILED:', err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
