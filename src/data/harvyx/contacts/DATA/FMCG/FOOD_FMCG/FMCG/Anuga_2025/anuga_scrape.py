import csv
import json
import re
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.anuga.com"
LIST_URL = f"{BASE_URL}/anuga-exhibitors/list-of-exhibitors/"
OUT_CSV = Path("/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025/Anuga_2025_Exhibitors.csv")
RATE_LIMIT_SECONDS = 0.5
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}
COLUMNS = ["Company", "Country", "Category", "Website", "Stand", "Email", "Phone"]


class RateLimitedSession:
    def __init__(self, min_interval: float = RATE_LIMIT_SECONDS) -> None:
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.min_interval = min_interval
        self._last_request_at = 0.0

    def get(self, url: str, *, retries: int = 3, **kwargs) -> requests.Response:
        last_error: Optional[Exception] = None
        for attempt in range(1, retries + 1):
            wait_for = self.min_interval - (time.monotonic() - self._last_request_at)
            if wait_for > 0:
                time.sleep(wait_for)
            try:
                response = self.session.get(url, timeout=30, **kwargs)
                self._last_request_at = time.monotonic()
                response.raise_for_status()
                return response
            except Exception as exc:  # noqa: BLE001
                self._last_request_at = time.monotonic()
                last_error = exc
                if attempt == retries:
                    raise
                sleep_for = max(self.min_interval, attempt)
                print(f"Retry {attempt}/{retries} for {url}: {exc}", flush=True)
                time.sleep(sleep_for)
        raise RuntimeError(f"Request failed for {url}: {last_error}")


def clean(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def load_organization_ldjson(soup: BeautifulSoup) -> Dict:
    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = script.string or script.get_text(" ", strip=True)
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except Exception:
            continue
        candidates = data if isinstance(data, list) else [data]
        for candidate in candidates:
            if isinstance(candidate, dict) and candidate.get("@type") == "Organization":
                return candidate
    return {}


def extract_country_from_ldjson(ldjson: Dict) -> str:
    address = ldjson.get("address") or {}
    if isinstance(address, dict):
        country = clean(address.get("addressCountry"))
        if country:
            return country
        locality = clean(address.get("addressLocality"))
        if locality:
            parts = [clean(part) for part in locality.split(",") if clean(part)]
            if parts:
                return parts[-1]
    return ""


def extract_section_items(soup: BeautifulSoup, section_title: str) -> List[str]:
    for title in soup.select(".db-acctitle"):
        title_text = clean(title.get_text(" ", strip=True))
        if title_text != section_title:
            continue
        container = title.find_next_sibling("div", class_="asdb-cap-products-list")
        if not container:
            return []
        items: List[str] = []
        for node in container.select(".asdb54-singleInfo-gruppierung"):
            value = clean(node.get_text(" ", strip=True))
            if value and value not in items:
                items.append(value)
        if items:
            return items
        text_value = clean(container.get_text(" ", strip=True))
        if text_value:
            return [text_value]
        return []
    return []


def extract_stand_from_detail(soup: BeautifulSoup) -> str:
    for selector in [".asdb54-rawTextHallenStand", ".texts", ".asdb54-hallen-bubble"]:
        node = soup.select_one(selector)
        if node:
            value = clean(node.get_text(" ", strip=True))
            if value:
                return value
    return ""


def extract_company_from_detail(soup: BeautifulSoup) -> str:
    node = soup.select_one(".headline-title")
    return clean(node.get_text(" ", strip=True)) if node else ""


def extract_website_from_detail(soup: BeautifulSoup) -> str:
    link = soup.select_one(".sico.ico_link.linkellipsis a[href^='http']")
    if link:
        return clean(link.get("href"))
    return ""


def is_valid_detail_page(soup: BeautifulSoup) -> bool:
    return bool(load_organization_ldjson(soup) or soup.select_one(".info-holder") or soup.select_one(".headline-title"))


def parse_listing_page(html: str) -> List[Dict[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    exhibitors: List[Dict[str, str]] = []
    seen_urls = set()
    for item in soup.select("div.esr.search-results div.item"):
        link = item.select_one("a.db-aslink[href]")
        if not link:
            continue
        detail_url = urljoin(BASE_URL, link["href"])
        if detail_url in seen_urls:
            continue
        seen_urls.add(detail_url)
        name = clean(link.get_text(" ", strip=True))
        country = ""
        col = item.select_one("div.col1ergebnis")
        if col:
            paragraphs = col.find_all("p", recursive=False)
            if paragraphs:
                country = clean(paragraphs[0].get_text(" ", strip=True))
        stand_link = item.select_one("a.ico_hall_stand[href], a[href*='standnr=']")
        stand = clean(stand_link.get_text(" ", strip=True)) if stand_link else ""
        exhibitors.append({
            "Company": name,
            "Country": country,
            "Category": "",
            "Website": "",
            "Stand": stand,
            "Email": "",
            "Phone": "",
            "detail_url": detail_url,
        })
    return exhibitors


def parse_detail_page(html: str, fallback: Dict[str, str]) -> Dict[str, str]:
    soup = BeautifulSoup(html, "html.parser")
    if not is_valid_detail_page(soup):
        raise ValueError("Unexpected detail page content")

    ldjson = load_organization_ldjson(soup)

    company = clean(ldjson.get("name")) or extract_company_from_detail(soup) or fallback["Company"]
    country = extract_country_from_ldjson(ldjson) or fallback["Country"]
    website = clean(ldjson.get("url")) or extract_website_from_detail(soup)
    email = clean(ldjson.get("email", "")).removeprefix("mailto:")
    phone = clean(ldjson.get("telephone"))
    stand = extract_stand_from_detail(soup) or fallback["Stand"]

    product_sector = extract_section_items(soup, "Product sector")
    trend_subjects = extract_section_items(soup, "Trend subjects")
    category = " | ".join(product_sector) if product_sector else ""
    if not category and trend_subjects:
        category = "; ".join(trend_subjects)

    return {
        "Company": company,
        "Country": country,
        "Category": category,
        "Website": website,
        "Stand": stand,
        "Email": email,
        "Phone": phone,
    }


def write_csv(rows: List[Dict[str, str]]) -> None:
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows([{key: row.get(key, "") for key in COLUMNS} for row in rows])


def main() -> int:
    client = RateLimitedSession()

    print(f"Investigating page structure: {LIST_URL}", flush=True)
    first_html = client.get(LIST_URL).text

    starts = sorted({int(value) for value in re.findall(r"start=(\d+)", first_html)})
    if not starts:
        starts = [0]
    elif 0 not in starts:
        starts = [0] + starts

    print(
        f"Found pagination via server-rendered route=aussteller/blaettern links: {len(starts)} pages, max start={max(starts)}",
        flush=True,
    )

    exhibitors_by_url: Dict[str, Dict[str, str]] = {}
    paginate_json = "%7B%22stichwort%22%3A%22%22%2C%22suchart%22%3A%22alle%22%7D"
    for index, start in enumerate(starts, start=1):
        if start == 0:
            html = first_html
        else:
            url = f"{LIST_URL}?route=aussteller/blaettern&&start={start}&paginatevalues={paginate_json}"
            html = client.get(url).text
        page_exhibitors = parse_listing_page(html)
        for exhibitor in page_exhibitors:
            exhibitors_by_url[exhibitor["detail_url"]] = exhibitor
        print(
            f"Collected list page {index}/{len(starts)} (start={start}) -> {len(page_exhibitors)} exhibitors; unique total={len(exhibitors_by_url)}",
            flush=True,
        )

    rows: List[Dict[str, str]] = []
    urls = sorted(exhibitors_by_url)
    total = len(urls)
    print(f"Fetching {total} exhibitor detail pages for website/category/contact data", flush=True)

    for idx, detail_url in enumerate(urls, start=1):
        fallback = exhibitors_by_url[detail_url]
        row = None
        last_error: Optional[Exception] = None
        for attempt in range(1, 4):
            try:
                detail_html = client.get(detail_url).text
                row = parse_detail_page(detail_html, fallback)
                if row["Website"] in {"https://www.anuga.de", "https://www.anuga.com/"}:
                    raise ValueError("Unexpected Anuga website fallback")
                break
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                if attempt < 3:
                    print(f"Retry detail parse {attempt}/3 for {detail_url}: {exc}", flush=True)
                    time.sleep(attempt)
        if row is None:
            print(f"Detail fetch failed for {detail_url}: {last_error}", flush=True)
            row = {key: fallback.get(key, "") for key in COLUMNS}
        rows.append(row)
        if idx % 50 == 0 or idx == total:
            write_csv(rows)
            print(f"Saved progress: {idx}/{total} detail pages -> {OUT_CSV}", flush=True)

    rows.sort(key=lambda row: (row["Company"].casefold(), row["Country"].casefold(), row["Stand"].casefold()))
    write_csv(rows)
    print(f"Done. Wrote {len(rows)} exhibitor rows to {OUT_CSV}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
