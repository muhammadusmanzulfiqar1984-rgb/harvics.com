const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/shared/EnterpriseCRM.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Fix the dangling commas in style objects
code = code.replace(/style=\{\{\s*,\s*/g, 'style={{');
code = code.replace(/style=\{\{\s*\}\}/g, '');
code = code.replace(/style=\{\{\s*WebkitFontSmoothing:[^}]+}}/g, '');

fs.writeFileSync(filePath, code);
