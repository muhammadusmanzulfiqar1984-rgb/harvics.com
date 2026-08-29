# enrich_leads.py
"""
Enrichment script (public‑website only)

- Recursively scans ~/Desktop/data (case‑insensitive) for CSV and Excel files.
- For each row it loads the company website (URL column called "Website" or similar).
- Uses requests + BeautifulSoup to scrape:
    * Company name          -> <title>
    * Description           -> <meta name="description">
    * Phone number(s)       -> regex search on the page text
    * Address               -> regex / heuristic near keywords "contact", "address", "location"
    * LinkedIn company URL  -> any href containing "linkedin.com/company/"
    * Industry              -> <meta name="keywords"> or best‑effort extraction
- Scoring logic (Tier 1 + Tier 2) as requested.
- Writes per‑file enriched CSVs and a master CSV in enriched/ folder.
- Generates a markdown report with counts and enrichment status.

Dependencies are auto‑installed if missing.
"""

import os
import re
import sys
import subprocess
import warnings
from pathlib import Path

# ------------------------------------------------------------
# Helper: ensure required packages are installed
# ------------------------------------------------------------
def ensure_packages():
    packages = {
        "pandas": "pandas",
        "requests": "requests",
        "bs4": "beautifulsoup4",
        "openpyxl": "openpyxl",
        "lxml": "lxml",
    }
    for import_name, pkg in packages.items():
        try:
            __import__(import_name)
        except ImportError:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

ensure_packages()

import pandas as pd
import requests
from bs4 import BeautifulSoup

# Suppress the XMLParsedAsHTMLWarning that appears when some sites serve XML
warnings.filterwarnings("ignore", category=UserWarning, module='bs4')

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
# Accept both lower‑case and upper‑case "data" folder names
BASE_DIR = Path(os.path.expanduser("~/Desktop"))
DATA_ROOT = None
for child in BASE_DIR.iterdir():
    if child.is_dir() and child.name.lower() == "data":
        DATA_ROOT = child
        break
if DATA_ROOT is None:
    raise RuntimeError("Could not locate a 'data' folder under ~/Desktop")
OUTPUT_ROOT = DATA_ROOT / "enriched"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------
# Regex utilities
# ------------------------------------------------------------
PHONE_REGEX = re.compile(r"(?:\\+\d{1,3}[ \-]?)?(?:\(\d{2,4}\)[ \-]?|\d{2,4}[ \-]?)?\d{3,4}[ \-]?\d{3,4}")
ADDRESS_KEYWORDS = ["contact", "address", "location", "headquarters", "office"]

# ------------------------------------------------------------
# Scrape a single website
# ------------------------------------------------------------
def scrape_website(url):
    result = {
        "company_name": "",
        "description": "",
        "phone": "",
        "address": "",
        "linkedin_url": "",
        "industry": "",
        "website_status": False,
    }
    try:
        resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        result["website_status"] = resp.status_code == 200
        if not result["website_status"]:
            return result
        soup = BeautifulSoup(resp.text, "lxml")
        # title -> company name
        if soup.title and soup.title.string:
            result["company_name"] = soup.title.string.strip()
        # meta description
        desc_tag = soup.find("meta", attrs={"name": "description"})
        if desc_tag and desc_tag.get("content"):
            result["description"] = desc_tag["content"].strip()
        # meta keywords -> industry (fallback)
        kw_tag = soup.find("meta", attrs={"name": "keywords"})
        if kw_tag and kw_tag.get("content"):
            result["industry"] = kw_tag["content"].strip()
        # LinkedIn company URL
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "linkedin.com/company/" in href:
                result["linkedin_url"] = href.split("?")[0]
                break
        # phone numbers – first match
        text = soup.get_text(separator=" ")
        phone_match = PHONE_REGEX.search(text)
        if phone_match:
            result["phone"] = phone_match.group(0)
        # address – simple heuristic around keywords
        lower_text = text.lower()
        for kw in ADDRESS_KEYWORDS:
            idx = lower_text.find(kw)
            if idx != -1:
                start = max(0, idx - 60)
                end = min(len(text), idx + 60)
                result["address"] = text[start:end].strip()
                break
    except Exception:
        result["website_status"] = False
    return result

# ------------------------------------------------------------
# Scoring logic (Tier 1 & Tier 2 as per updated spec)
# ------------------------------------------------------------
def score_row(row, enrichment):
    # Tier 1 checks (each successful adds 1 point)
    tier1 = 0
    email = str(row.get("Email", "")).strip()
    if email and not email.lower().endswith(("@gmail.com", "@yahoo.com", "@outlook.com")):
        tier1 += 1
    if enrichment.get("website_status"):
        tier1 += 1
    title = str(row.get("Title", "")).lower()
    allowed = ["ceo", "owner", "md", "founder", "director"]
    if any(t in title for t in allowed):
        tier1 += 1
    # Tier 2 – Fair column non‑empty
    tier2 = 1 if pd.notna(row.get("Fair", None)) and str(row.get("Fair")).strip() else 0
    return tier1 + tier2

# ------------------------------------------------------------
# Process a single DataFrame
# ------------------------------------------------------------
def enrich_dataframe(df, source_name):
    website_col = next((c for c in df.columns if c.lower() == "website"), None)
    if not website_col:
        df["enrichment_status"] = "partial"
        df["score"] = 0
        return df
    enriched_rows = []
    for _, row in df.iterrows():
        url = str(row.get(website_col, "")).strip()
        enrichment = scrape_website(url) if url else {}
        row["company_name_scraped"] = enrichment.get("company_name", "")
        row["description"] = enrichment.get("description", "")
        row["phone_scraped"] = enrichment.get("phone", "")
        row["address"] = enrichment.get("address", "")
        row["linkedin_company_url"] = enrichment.get("linkedin_url", "")
        row["industry"] = enrichment.get("industry", "")
        missing = [row["company_name_scraped"], row["description"], row["phone_scraped"],
                   row["address"], row["linkedin_company_url"], row["industry"]]
        row["enrichment_status"] = "complete" if all(missing) else "partial"
        row["score"] = score_row(row, enrichment)
        enriched_rows.append(row)
    # Create DataFrame; ensure required columns exist even if no rows were added
    enriched_df = pd.DataFrame(enriched_rows)
    # If the DataFrame is empty, add the columns with appropriate dtypes
    if enriched_df.empty:
        enriched_df = pd.DataFrame(columns=[
            "company_name_scraped",
            "description",
            "phone_scraped",
            "address",
            "linkedin_company_url",
            "industry",
            "enrichment_status",
            "score",
        ])
    else:
        # Ensure the two key columns are present (they should be, but safeguard)
        if "enrichment_status" not in enriched_df.columns:
            enriched_df["enrichment_status"] = "partial"
        if "score" not in enriched_df.columns:
            enriched_df["score"] = 0
    return enriched_df

# ------------------------------------------------------------
# Main driver – iterate over files
# ------------------------------------------------------------
def main():
    master_frames = []
    report = {
        "total_files": 0,
        "total_rows": 0,
        "complete": 0,
        "partial": 0,
        "score_counts": {},
    }
    for root, _, files in os.walk(DATA_ROOT):
        # Skip the output folder to avoid re‑processing enriched files
        if Path(root).resolve().is_relative_to(OUTPUT_ROOT.resolve()):
            continue
        for fname in files:
            # Skip files that are already enriched or not data files
            if '_enriched' in fname.lower():
                continue
            if not (fname.lower().endswith('.csv') or fname.lower().endswith('.xlsx')):
                continue
            report["total_files"] += 1
            src_path = Path(root) / fname
            try:
                if fname.lower().endswith('.csv'):
                    # Read CSV without forcing all columns to strings to allow numeric scores
                    df = pd.read_csv(src_path, keep_default_na=False, engine='python')
                else:
                    # Read Excel similarly without dtype enforcement
                    df = pd.read_excel(src_path, engine='openpyxl')
                # Remove any pre‑existing 'score' column that may be typed as string
                if 'score' in df.columns:
                    df = df.drop(columns=['score'])
            except Exception as e:
                print(f"Failed to read {src_path}: {e}")
                continue
            enriched_df = enrich_dataframe(df, fname)
            out_name = f"{Path(fname).stem}_enriched.csv"
            out_path = OUTPUT_ROOT / out_name
            enriched_df.to_csv(out_path, index=False)
            master_frames.append(enriched_df)
            report["total_rows"] += len(enriched_df)
            report["complete"] += (enriched_df["enrichment_status"] == "complete").sum()
            report["partial"] += (enriched_df["enrichment_status"] == "partial").sum()
            for sc in enriched_df["score"]:
                report["score_counts"][sc] = report["score_counts"].get(sc, 0) + 1
    if master_frames:
        master_df = pd.concat(master_frames, ignore_index=True)
        master_df.to_csv(OUTPUT_ROOT / "master_enriched.csv", index=False)
    report_path = OUTPUT_ROOT / "lead_scoring_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Lead Enrichment & Scoring Report\n\n")
        f.write(f"- Files processed: {report['total_files']}\n")
        f.write(f"- Total rows processed: {report['total_rows']}\n")
        f.write(f"- Fully enriched rows: {report['complete']}\n")
        f.write(f"- Partially enriched rows: {report['partial']}\n\n")
        f.write("## Score distribution (outreach recommendation)\n\n")
        f.write("| Score | Leads | Recommendation |\n")
        f.write("|-------|-------|----------------|\n")
        for sc in sorted(report['score_counts'].keys()):
            cnt = report['score_counts'][sc]
            if sc <= 1:
                rec = "skip"
            elif sc == 2:
                rec = "email only"
            elif sc == 3:
                rec = "email + LinkedIn"
            else:
                rec = "full enrichment"
            f.write(f"| {sc} | {cnt} | {rec} |\n")
    print("Enrichment completed. Master CSV and report written to", OUTPUT_ROOT)

if __name__ == "__main__":
    main()
