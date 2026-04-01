#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');

// Read the English locale as reference
const enPath = path.join(localesDir, 'en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Get all JSON files except en.json
const files = fs.readdirSync(localesDir)
  .filter(f => f.endsWith('.json') && f !== 'en.json');

let updated = 0;

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    let modified = false;
    
    // Update form keys with new sub-keys
    if (json.form && enContent.form) {
      Object.keys(enContent.form).forEach(key => {
        if (!json.form[key]) {
          json.form[key] = enContent.form[key];
          modified = true;
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      console.log(`✅ Updated ${file}`);
      updated++;
    } else {
      console.log(`⏭️  Skipped ${file} - already up to date`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Updated: ${updated} files`);
