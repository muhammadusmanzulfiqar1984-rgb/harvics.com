"""
apply_translations.py
=====================
Run this after a translator returns a completed workbook.

Usage:
  python3 apply_translations.py <locale_code>
  python3 apply_translations.py ar
  python3 apply_translations.py all   # applies all completed workbooks

A "translation" field in the workbook is considered complete when it is
non-empty and different from the English value.
"""

import os
import sys
import json

LOCALES_DIR = '../src/locales'
WORKBOOKS_DIR = '.'

def set_nested(d, key_path, value):
    """Set a value in a nested dict using dot-notation key."""
    parts = key_path.split('.')
    for part in parts[:-1]:
        d = d.setdefault(part, {})
    d[parts[-1]] = value

def apply_locale(code):
    workbook_path = os.path.join(WORKBOOKS_DIR, f'{code}.json')
    locale_path = os.path.join(LOCALES_DIR, f'{code}.json')

    if not os.path.exists(workbook_path):
        print(f'ERROR: No workbook found for {code}')
        return 0

    if not os.path.exists(locale_path):
        print(f'ERROR: No locale file found for {code}')
        return 0

    workbook = json.load(open(workbook_path, encoding='utf-8'))
    locale = json.load(open(locale_path, encoding='utf-8'))
    keys = workbook.get('keys', {})

    applied = 0
    skipped = 0

    for key, entry in keys.items():
        translation = entry.get('translation', '').strip()
        en_val = entry.get('en', '')

        if not translation or translation == en_val:
            skipped += 1
            continue

        # Apply the translation into the locale file
        set_nested(locale, key, translation)
        applied += 1

    if applied > 0:
        with open(locale_path, 'w', encoding='utf-8') as f:
            json.dump(locale, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print(f'  {code}: Applied {applied} translations ({skipped} skipped/empty)')
    else:
        print(f'  {code}: Nothing to apply — all translation fields are empty')

    return applied

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 apply_translations.py <locale_code|all>')
        sys.exit(1)

    target = sys.argv[1].lower()

    if target == 'all':
        total = 0
        for fn in sorted(os.listdir(WORKBOOKS_DIR)):
            if fn.endswith('.json') and not fn.startswith('_'):
                code = fn.replace('.json', '')
                total += apply_locale(code)
        print(f'\nDone. Total translations applied: {total}')
    else:
        apply_locale(target)
