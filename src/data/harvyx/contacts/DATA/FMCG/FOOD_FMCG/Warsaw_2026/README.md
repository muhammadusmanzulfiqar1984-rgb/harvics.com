# Warsaw Food Expo — Data Collection Notes

**Event:** Warsaw Food Expo (Międzynarodowe Targi Żywności i Napojów)
**Location:** Ptak Warsaw Expo, Nadarzyn, Poland
**Source site:** https://warsawfoodexpo.pl/

---

## 1. Files in this folder

| File | Rows | What it is |
|---|---|---|
| `Warsaw food Expo Poland.csv` | **439** | Master exhibitor list — merged 2023 + 2024 + 2025 catalogs, enriched with website + email + phone + socials scraped from each company's site |
| `Warsaw_Food_Expo_Decision_Makers.csv` | ~30 | Manually/curated decision-maker contacts (founders, CEOs, sales heads) for priority companies |
| `apollo-contacts-export (1).csv` | ~150 | Apollo.io export — Polish food-industry contacts (RC Foods, etc.) with verified emails, titles, LinkedIn URLs |

---

## 2. What has been done

### Step A — Catalog scraping (source: warsawfoodexpo.pl)
The site uses a Vue.js catalog with `var katalog_data = [...]` embedded in the page HTML for each year.
- Fetched the 2023, 2024, 2025 catalog pages (PL + EN versions).
- Extracted `katalog_data` JSON via regex.
- Parsed fields: `Nazwa_wystawcy` (name), `Numer_stoiska` (stand), `www`, `Opis_pl/en` (description), `Ogólny kontakt firmy` (general contact), `NIP` (tax ID), `URL_logo_wystawcy` (logo).
- Year totals: 2023 → 48, 2024 → 193, 2025 → 256.

### Step B — Merging across years
- De-duplicated by company name (lowercased).
- Kept per-year stand numbers + status as separate columns (`stand_2023`, `stand_2024`, `stand_2025`).
- Result: **439 unique exhibitors** across all 3 years.

### Step C — Web enrichment
For each of the 439 rows the scraper:
1. Resolved the **real website** — the catalog `www` field often contained placeholders (`brak.pl`, `aleo.com` listings, `brak@brak.pl`); used DuckDuckGo search to find the real domain when the placeholder was detected.
2. **Crawled** homepage + `/contact`, `/about`, `/kontakt` pages with a polite delay.
3. **Extracted via regex / DOM parsing**:
   - `email` (mailto links + plain-text emails, filtered out generics)
   - `phone` (Polish + intl. patterns)
   - `linkedin`, `facebook`, `instagram`, `youtube`, `tiktok` (anchor tags pointing to those domains)
   - `representative` (when an "About / Team" page listed Name + Role)
   - `whatsapp` (only when a `wa.me/` link or "WhatsApp" label was explicitly present)

### Step D — Final fill rates (out of 439)

| Field | Filled | % |
|---|---|---|
| `real_website` | 277 | 63% |
| `phone` | 268 | 61% |
| `email` | 226 | 51% |
| `facebook` | 166 | 38% |
| `instagram` | 120 | 27% |
| `linkedin` | 72 | 16% |
| `representative` | 51 | 12% |
| `whatsapp` | 9 | 2% |

---

## 3. How (technical recap)

- **Language:** Python 3 (stdlib only — `urllib`, `re`, `csv`, `concurrent.futures`).
- **Concurrency:** thread pool, ~12 workers, polite User-Agent, ~30 s timeout per host.
- **Total runtime:** ~6.5 minutes for the 439-row enrichment pass.
- **Saved progress every 25 rows** so the file was usable mid-run.
- All raw per-year CSVs (2023/2024/2025) and the un-enriched merged file were deleted once the final master was verified.

---

## 4. What is NOT in the data (and why)

- **WhatsApp numbers (only 2%)** — almost never publicly listed. Polish food SMEs publish landline + mobile, not a WhatsApp-tagged number. The phone column is reliable; you can WhatsApp those numbers manually.
- **Representative name (only 12%)** — only captured where a company has a public "About / Team" page with Name + Role in plain HTML. Most small producers don't have that.
- **LinkedIn (16%)** — only captured when the company links to it from their own site footer/header. Searching LinkedIn directly was skipped (LinkedIn blocks scraping aggressively; needs paid API or manual lookup).
- **No site at all (~37% of rows)** — these are sole-proprietors whose only web presence is a Facebook page or an `aleo.com` / KRS registry listing.

---

## 5. What's next (prioritized)

### Priority 1 — Lift social/contact coverage
For the ~166 rows that have a Facebook URL but no email/phone:
- **Crawl the Facebook page's "About" tab** — typically exposes phone, WhatsApp button, email, hours, address. Expected lift: +15–20 pp on phone, +10 pp on WhatsApp.
- Implementation note: Facebook public pages need a logged-in session OR `mbasic.facebook.com` fallback (limited but no JS needed).

### Priority 2 — Decision-maker layer
Currently `Warsaw_Food_Expo_Decision_Makers.csv` is small. To scale:
- Cross-reference the 439 companies against `apollo-contacts-export (1).csv` by company name fuzzy match.
- For un-matched companies, run an Apollo / Lusha / Hunter.io enrichment pass keyed by domain → returns titled contacts (CEO / Sales Director / Export Manager). Expected: 250–300 additional decision-maker rows.
- Output: `Warsaw_Food_Expo_Decision_Makers_v2.csv` with `name, title, email, linkedin, phone, company, source`.

### Priority 3 — LinkedIn company URL backfill
For the ~370 rows missing a LinkedIn URL:
- Use Google's `site:linkedin.com/company "<exhibitor name>" Poland` query, parse the first organic result.
- Expected lift: 16% → 50–60% LinkedIn coverage.
- Risk: Google blocks rapid scraping; needs delay or a search API (Serper / SerpAPI ~ $0.30 per 1000 queries).

### Priority 4 — Outreach segmentation
Once enrichment is satisfactory, segment the master into:
- **A-list** — has email + phone + LinkedIn + decision-maker name (≈80 companies, top quality).
- **B-list** — has email + phone (≈226 companies, generic info@).
- **C-list** — site only, manual outreach (≈140 companies).

### Priority 5 — Update cadence
- The Warsaw site re-publishes the catalog roughly 1 month before each March show.
- Re-run the catalog scraper in **Feb 2027** to capture the 2026 → 2027 delta and add new exhibitors.

---

*Last updated: 3 June 2026*
