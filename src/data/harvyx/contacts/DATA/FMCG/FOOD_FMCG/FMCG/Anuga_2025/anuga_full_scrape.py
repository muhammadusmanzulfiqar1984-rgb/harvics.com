import importlib.util
import json
import re
import string
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional

import requests

SCRAPER_HELPERS = "/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025/anuga_scrape.py"
OUT_CSV = Path("/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025/Anuga_2025_Exhibitors.csv")
OUT_URLS = Path("/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025/anuga_full_listing_urls.json")
ALPHAS = ["09", *list(string.ascii_uppercase)]

spec = importlib.util.spec_from_file_location("anuga_scrape", SCRAPER_HELPERS)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class StatelessRateLimitedFetcher:
    def __init__(self, min_interval: float = mod.RATE_LIMIT_SECONDS) -> None:
        self.min_interval = min_interval
        self._lock = threading.Lock()
        self._next_request_at = 0.0

    def _wait_turn(self) -> None:
        with self._lock:
            now = time.monotonic()
            scheduled = max(now, self._next_request_at)
            self._next_request_at = scheduled + self.min_interval
        wait_for = scheduled - now
        if wait_for > 0:
            time.sleep(wait_for)

    def get(self, url: str, *, retries: int = 3) -> str:
        last_error: Optional[Exception] = None
        for attempt in range(1, retries + 1):
            self._wait_turn()
            try:
                response = requests.get(url, headers=mod.HEADERS, timeout=30)
                response.raise_for_status()
                return response.text
            except Exception as exc:  # noqa: BLE001
                last_error = exc
                if attempt == retries:
                    raise
                print(f"Retry {attempt}/{retries} for {url}: {exc}", flush=True)
                time.sleep(max(self.min_interval, attempt))
        raise RuntimeError(f"Request failed for {url}: {last_error}")


def collect_listing_rows(fetcher: StatelessRateLimitedFetcher) -> Dict[str, Dict[str, str]]:
    exhibitors_by_url: Dict[str, Dict[str, str]] = {}
    for alpha in ALPHAS:
        first_url = f"{mod.LIST_URL}?route=aussteller&&tab=2&alpha={alpha}"
        first_html = fetcher.get(first_url)
        starts = sorted({int(value) for value in re.findall(r"start=(\d+)", first_html)})
        if not starts:
            starts = [0]
        elif 0 not in starts:
            starts = [0] + starts

        for index, start in enumerate(starts, start=1):
            html = first_html if start == 0 else fetcher.get(f"{first_url}&start={start}")
            page_rows = mod.parse_listing_page(html)
            for exhibitor in page_rows:
                exhibitors_by_url[exhibitor["detail_url"]] = exhibitor
            print(
                f"Alpha {alpha}: page {index}/{len(starts)} start={start} -> {len(page_rows)} exhibitors; unique total={len(exhibitors_by_url)}",
                flush=True,
            )

    listing_rows = sorted(
        exhibitors_by_url.values(),
        key=lambda row: (row["Company"].casefold(), row["Country"].casefold(), row["Stand"].casefold()),
    )
    OUT_URLS.write_text(json.dumps(listing_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(listing_rows)} listing rows to {OUT_URLS}", flush=True)
    return exhibitors_by_url


def fetch_detail_row(fetcher: StatelessRateLimitedFetcher, detail_url: str, fallback: Dict[str, str]) -> Dict[str, str]:
    row = None
    last_error: Optional[Exception] = None
    for attempt in range(1, 4):
        try:
            detail_html = fetcher.get(detail_url)
            row = mod.parse_detail_page(detail_html, fallback)
            if row["Website"] in {"https://www.anuga.de", "https://www.anuga.com/"}:
                raise ValueError("Unexpected Anuga website fallback")
            return row
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt < 3:
                print(f"Retry detail parse {attempt}/3 for {detail_url}: {exc}", flush=True)
                time.sleep(attempt)
    print(f"Detail fetch failed for {detail_url}: {last_error}", flush=True)
    return {key: fallback.get(key, "") for key in mod.COLUMNS}



def main() -> int:
    fetcher = StatelessRateLimitedFetcher()
    print(f"Investigating page structure via alpha filters on {mod.LIST_URL}", flush=True)
    exhibitors_by_url = collect_listing_rows(fetcher)

    urls = sorted(exhibitors_by_url)
    total = len(urls)
    rows: List[Dict[str, str]] = []
    print(f"Fetching {total} exhibitor detail pages", flush=True)

    with ThreadPoolExecutor(max_workers=40) as executor:
        futures = {
            executor.submit(fetch_detail_row, fetcher, detail_url, exhibitors_by_url[detail_url]): detail_url
            for detail_url in urls
        }
        for idx, future in enumerate(as_completed(futures), start=1):
            rows.append(future.result())
            if idx % 50 == 0 or idx == total:
                rows.sort(key=lambda r: (r["Company"].casefold(), r["Country"].casefold(), r["Stand"].casefold()))
                mod.write_csv(rows)
                print(f"Saved progress: {idx}/{total} detail pages -> {OUT_CSV}", flush=True)

    rows.sort(key=lambda row: (row["Company"].casefold(), row["Country"].casefold(), row["Stand"].casefold()))
    mod.write_csv(rows)
    print(f"Done. Wrote {len(rows)} exhibitor rows to {OUT_CSV}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
