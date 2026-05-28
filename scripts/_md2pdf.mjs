import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const mdPath = process.argv[2];
const pdfPath = process.argv[3];
const md = fs.readFileSync(mdPath, 'utf8');

// Minimal MD→HTML (handles the formats we used)
function mdToHtml(md) {
  let h = md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^```([\s\S]*?)^```/gm, (_,c)=>`<pre><code>${c}</code></pre>`)
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.slice(2,-2).split(' | ').map(c=>`<td>${c}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    .replace(/(<tr>[\s\S]+?<\/tr>)+/g, m => `<table>${m}</table>`)
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, '<p>$1</p>')
    .replace(/<p><(h[1-3]|table|ul|pre|hr)/g, '<$1')
    .replace(/(<\/(h[1-3]|table|ul|pre)>)<\/p>/g, '$1');
  return h;
}

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>HARVICS Session Handoff</title>
<style>
  @page { margin: 18mm 14mm; size: A4; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111; font-size: 11px; line-height: 1.55; }
  h1 { color: #6B1F2B; border-bottom: 3px solid #C9A84C; padding-bottom: 6px; font-size: 22px; margin-top: 24px; }
  h2 { color: #6B1F2B; border-bottom: 1px solid #ddd; padding-bottom: 4px; font-size: 16px; margin-top: 22px; }
  h3 { color: #6B1F2B; font-size: 13px; margin-top: 16px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10px; }
  td, th { border: 1px solid #ddd; padding: 5px 8px; text-align: left; vertical-align: top; }
  tr:nth-child(odd) td { background: #FAFAFA; }
  code { background: #F4F4F4; padding: 1px 5px; border-radius: 3px; font-family: "SF Mono", Menlo, monospace; font-size: 10px; color: #6B1F2B; }
  pre { background: #F4F4F4; padding: 10px; border-radius: 5px; overflow-x: auto; font-size: 10px; }
  pre code { background: transparent; padding: 0; color: #111; }
  hr { border: 0; border-top: 1px solid #ddd; margin: 16px 0; }
  ul { padding-left: 20px; }
  strong { color: #6B1F2B; }
  .footer { position: fixed; bottom: 6mm; right: 14mm; font-size: 8px; color: #999; }
</style></head>
<body>
${mdToHtml(md)}
<div class="footer">HARVICS OS · Session Handoff · 2026-05-27</div>
</body></html>`;

const tmpHtml = '/tmp/_harvics_handoff.html';
fs.writeFileSync(tmpHtml, html);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle0' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  margin: { top: '18mm', right: '14mm', bottom: '18mm', left: '14mm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;">HARVICS OS — Session Handoff 2026-05-27</div>',
  footerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
});
await browser.close();
console.log('✅ PDF written:', pdfPath);
