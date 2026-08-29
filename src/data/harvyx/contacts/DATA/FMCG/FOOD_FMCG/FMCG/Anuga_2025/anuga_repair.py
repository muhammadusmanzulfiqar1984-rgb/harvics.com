import csv
import importlib.util
from pathlib import Path

SCRAPER_PATH = "/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025/anuga_scrape.py"
CSV_PATH = Path("/Users/shahtabraiz/Desktop/Exhibitions/FMCG/Anuga_2025/Anuga_2025_Exhibitors.csv")
ANUGA_WEBSITES = {"https://www.anuga.de", "https://www.anuga.com/"}

spec = importlib.util.spec_from_file_location("anuga_scrape", SCRAPER_PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def norm(text: str) -> str:
    text = mod.clean(text)
    return text.replace('"', '').replace('“', '').replace('”', '').replace('’', "'").casefold()


def key_for(row):
    return (norm(row.get("Company", "")), norm(row.get("Country", "")), norm(row.get("Stand", "")))


def write_rows(rows):
    with CSV_PATH.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=mod.COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))

    suspects = [
        idx for idx, row in enumerate(rows)
        if row.get("Website") in ANUGA_WEBSITES or (not row.get("Category") and not row.get("Email") and not row.get("Phone"))
    ]
    print(f"Loaded {len(rows)} rows; repairing {len(suspects)} suspect rows", flush=True)

    client = mod.RateLimitedSession()
    first_html = client.get(mod.LIST_URL).text
    starts = sorted({int(value) for value in mod.re.findall(r"start=(\d+)", first_html)})
    if 0 not in starts:
        starts = [0] + starts
    paginate_json = "%7B%22stichwort%22%3A%22%22%2C%22suchart%22%3A%22alle%22%7D"

    mapping = {}
    for index, start in enumerate(starts, start=1):
        html = first_html if start == 0 else client.get(
            f"{mod.LIST_URL}?route=aussteller/blaettern&&start={start}&paginatevalues={paginate_json}"
        ).text
        page_rows = mod.parse_listing_page(html)
        for row in page_rows:
            mapping[key_for(row)] = row["detail_url"]
        print(f"Mapped list page {index}/{len(starts)} -> {len(page_rows)} rows; keys={len(mapping)}", flush=True)

    repaired = 0
    missing = 0
    for count, idx in enumerate(suspects, start=1):
        row = rows[idx]
        detail_url = mapping.get(key_for(row))
        if not detail_url:
            missing += 1
            print(f"Missing detail URL for: {row['Company']} | {row['Country']} | {row['Stand']}", flush=True)
            continue
        detail_html = client.get(detail_url).text
        parsed = mod.parse_detail_page(detail_html, row)
        rows[idx] = parsed
        repaired += 1
        if count % 50 == 0 or count == len(suspects):
            write_rows(rows)
            print(f"Repaired {count}/{len(suspects)} suspect rows (updated={repaired}, missing={missing})", flush=True)

    rows.sort(key=lambda row: (row["Company"].casefold(), row["Country"].casefold(), row["Stand"].casefold()))
    write_rows(rows)
    print(f"Repair complete. Updated {repaired} rows; missing {missing}. Output: {CSV_PATH}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
