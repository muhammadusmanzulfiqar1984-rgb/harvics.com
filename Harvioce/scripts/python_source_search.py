#!/usr/bin/env python3
import argparse
import json


def main():
    parser = argparse.ArgumentParser(description='Trial python source search placeholder')
    parser.add_argument('--query', required=False, default='')
    parser.add_argument('--location', required=False, default='')
    parser.add_argument('--limit', required=False, type=int, default=10)
    _ = parser.parse_args()

    # Placeholder for multi-source python scraping engine.
    # Return empty list when no live scraping adapter is configured.
    print(json.dumps([]))


if __name__ == '__main__':
    main()
