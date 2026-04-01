const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src/components/portals/DistributorDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the formatCurrency block using indexOf/slice
const startMarker = '  const formatCurrency = (amount: number) => {';
const endMarker = '\n  }\n\n  if (loading)';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf('\n  }\n\n  if (loading)');

if (startIdx === -1) {
  console.log('ERROR: formatCurrency not found');
  process.exit(1);
}

const closingBrace = content.indexOf('\n  }', startIdx);

const replacement = `  const formatCurrency = (amount: number) => {
    const currencyCode = countryData?.currency?.code || 'USD'
    let convertedAmount = amount
    if (countryData?.currency?.fxRateUSD && currencyCode !== 'USD') {
      convertedAmount = amount * (countryData.currency.fxRateUSD || 1)
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(convertedAmount)
  }

  const handleLogout = () => {
    apiClient.clearToken()
    router.push(\`/\${locale}/portals/\`)
  }`;

const oldBlock = content.slice(startIdx, closingBrace + 3);
content = content.replace(oldBlock, replacement);

fs.writeFileSync(filePath, content);
console.log('Done. Replaced formatCurrency block, added handleLogout.');
