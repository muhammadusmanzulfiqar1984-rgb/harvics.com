/**
 * Asset Structure Check Script
 * Verifies that required top‑level asset directories exist and contain at least one file.
 * Exits with code 0 on success, non‑zero on failure.
 */

const fs = require('fs');
const path = require('path');

const requiredDirs = [
  'public/assets/brand',
  'public/assets/corporate',
  'public/assets/geo',
  'public/assets/media',
  'public/assets/shared',
  'public/assets/verticals',
];

let hasError = false;

requiredDirs.forEach(dir => {
  const fullPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) {
    console.error(`❌ Missing required asset directory: ${dir}`);
    hasError = true;
    return;
  }
  const files = fs.readdirSync(fullPath);
  if (files.length === 0) {
    console.warn(`⚠️  Directory exists but is empty: ${dir}`);
  } else {
    console.log(`✅ ${dir} contains ${files.length} item(s).`);
  }
});

process.exit(hasError ? 1 : 0);