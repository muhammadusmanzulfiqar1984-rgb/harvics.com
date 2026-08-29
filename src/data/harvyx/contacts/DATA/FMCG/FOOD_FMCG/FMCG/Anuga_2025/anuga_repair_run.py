import csv
import importlib.util
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Set, Tuple

BASE_DIR = Path("/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025")
SCRAPER_PATH = BASE_DIR / "anuga_scrape.py"
FULL_SCRAPE_PATH = BASE_DIR / "anuga_full_scrape.py"
CSV_PATH = BASE_DIR / "Anuga_2025_Exhibitors.csv"
JSON_PATH = BASE_DIR / "anuga_full_listing_urls.json"
ANUGA_WEBSITES = {"https://www.anuga.de", "https://www.anuga.com/"}


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


mod = load_module("anuga_scrape", SCRAPER_PATH)
full = load_module("anuga_full_scrape", FULL_SCRAPE_PATH)


def norm(text: str) -> str:
    text = mod.clean(text)
    return text.replace('"', '').replace('“', '').replace('”', '').replace('’', "'").casefold()


def key_for(row: Dict[str, str]) -> Tuple[str, str, str]:
    return (norm(row.get("Company", "")), norm(row.get("Country", "")), norm(row.get("Stand", "")))


def row_is_suspect(row: Dict[str, str]) -> bool:
    website = mod.clean(row.get("Website", ""))
    email = mod.clean(row.get("Email", ""))
    phone = mod.clean(row.get("Phone", ""))
    return website in ANUGA_WEBSITES or (not website and not email and not phone)


def fetch_one(fetcher, detail_url: str, fallback: Dict[str, str]) -> Dict[str, str]:
    row = full.fetch_detail_row(fetcher, detail_url, fallback)
    return {column: row.get(column, "") for column in mod.COLUMNS}


def main() -> int:
    listing_rows: List[Dict[str, str]] = mod.json.loads(JSON_PATH.read_text(encoding="utf-8"))
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as fh:
        existing_rows: List[Dict[str, str]] = list(csv.DictReader(fh))

    listing_by_key: Dict[Tuple[str, str, str], Dict[str, str]] = {}
    listing_by_url: Dict[str, Dict[str, str]] = {}
    for row in listing_rows:
        key = key_for(row)
        listing_by_key[key] = row
        detail_url = row.get("detail_url", "")
        if detail_url:
            listing_by_url[detail_url] = row

    existing_by_key: Dict[Tuple[str, str, str], Dict[str, str]] = {}
    for row in existing_rows:
        existing_by_key[key_for(row)] = {column: row.get(column, "") for column in mod.COLUMNS}

    missing_keys: Set[Tuple[str, str, str]] = {key for key in listing_by_key if key not in existing_by_key}
    suspect_existing_keys: Set[Tuple[str, str, str]] = {key_for(row) for row in existing_rows if row_is_suspect(row)}
    keys_to_refetch = missing_keys | suspect_existing_keys

    print(f"Listing rows loaded: {len(listing_rows)}", flush=True)
    print(f"Existing CSV rows loaded: {len(existing_rows)}", flush=True)
    print(f"Missing from CSV: {len(missing_keys)}", flush=True)
    print(f"Suspect existing rows: {len(suspect_existing_keys)}", flush=True)
    print(f"Total keys to re-fetch: {len(keys_to_refetch)}", flush=True)

    refetch_targets = []
    unmatched_keys = []
    for key in sorted(keys_to_refetch):
        listing_row = listing_by_key.get(key)
        if not listing_row or not listing_row.get("detail_url"):
            unmatched_keys.append(key)
            continue
        refetch_targets.append((key, listing_row["detail_url"], listing_row))

    print(f"Fetchable targets: {len(refetch_targets)}", flush=True)
    print(f"Unmatched suspect keys: {len(unmatched_keys)}", flush=True)
    for idx, key in enumerate(unmatched_keys[:20], start=1):
        print(f"  Unmatched {idx}: {key}", flush=True)

    merged_by_key = dict(existing_by_key)
    fetcher = full.StatelessRateLimitedFetcher(min_interval=0.5)
    total = len(refetch_targets)
    completed = 0
    updated = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {
            executor.submit(fetch_one, fetcher, detail_url, fallback): (key, detail_url)
            for key, detail_url, fallback in refetch_targets
        }
        for future in as_completed(futures):
            key, detail_url = futures[future]
            completed += 1
            try:
                row = future.result()
                if not row.get("Company"):
                    raise ValueError("Empty parsed company")
                merged_by_key[key] = row
                updated += 1
            except Exception as exc:  # noqa: BLE001
                failed += 1
                fallback = listing_by_url.get(detail_url) or listing_by_key.get(key) or {}
                merged_by_key[key] = {column: fallback.get(column, "") for column in mod.COLUMNS}
                print(f"FAILED {completed}/{total}: {detail_url} -> {exc}", flush=True)
                continue

            if completed <= 20 or completed % 50 == 0 or completed == total:
                print(
                    f"Fetched {completed}/{total} | updated={updated} failed={failed} | {row.get('Company', '')}",
                    flush=True,
                )

    final_rows = sorted(
        [{column: row.get(column, "") for column in mod.COLUMNS} for row in merged_by_key.values()],
        key=lambda row: (row["Company"].casefold(), row["Country"].casefold(), row["Stand"].casefold()),
    )
    mod.write_csv(final_rows)

    bad_rows = [row for row in final_rows if row.get("Website") in ANUGA_WEBSITES]
    empty_rows = [
        row for row in final_rows
        if not mod.clean(row.get("Website", "")) and not mod.clean(row.get("Email", "")) and not mod.clean(row.get("Phone", ""))
    ]

    print(f"Done. Final rows written: {len(final_rows)}", flush=True)
    print(f"Failed fetches: {failed}", flush=True)
    print(f"Bad website rows after merge: {len(bad_rows)}", flush=True)
    print(f"Empty website+email+phone rows after merge: {len(empty_rows)}", flush=True)
    print(f"Output: {CSV_PATH}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
