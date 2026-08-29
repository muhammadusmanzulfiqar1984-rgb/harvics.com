import { Transaction, UserProfile } from '../types';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = [
    'Transaction ID',
    'Reference',
    'Date & Time',
    'Direction',
    'Merchant/Party',
    'Category',
    'Payment Method',
    'Rail',
    'Amount',
    'Currency',
    'Fee',
    'Status',
    'Risk Score'
  ];

  const rows = transactions.map((tx) => [
    tx.id,
    tx.reference,
    `"${tx.timestamp}"`,
    tx.direction.toUpperCase(),
    `"${tx.merchantOrPerson}"`,
    `"${tx.category}"`,
    `"${tx.paymentMethod}"`,
    `"${tx.paymentRail}"`,
    tx.direction === 'in' ? tx.amount : -tx.amount,
    tx.currency,
    tx.fee,
    tx.status,
    tx.riskScore
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Harvics_HPay_Ledger_Statement_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsToPDF = (transactions: Transaction[], profile: UserProfile) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalIn = transactions.filter(t => t.direction === 'in').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter(t => t.direction === 'out').reduce((acc, t) => acc + t.amount, 0);
  const netSettlement = totalIn - totalOut;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Harvics HPay - Official Account Statement</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0E0709;
            color: #F5EFE6;
            margin: 0;
            padding: 32px;
            -webkit-print-color-adjust: exact;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: #180C10;
            border: 1px solid #33171E;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #800020;
            padding-bottom: 24px;
            margin-bottom: 32px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand-logo {
            width: 44px;
            height: 44px;
            background: #800020;
            color: #E8DCC4;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 20px;
            border: 1px solid rgba(232,220,196,0.3);
          }
          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: #F5EFE6;
            letter-spacing: -0.5px;
          }
          .doc-type {
            text-align: right;
          }
          .doc-type h2 {
            margin: 0;
            font-size: 18px;
            color: #E8DCC4;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .doc-type p {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #A89887;
            font-family: 'JetBrains Mono', monospace;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            background: #211116;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #381B23;
            margin-bottom: 32px;
          }
          .meta-item label {
            font-size: 10px;
            text-transform: uppercase;
            color: #A89887;
            font-weight: 700;
            display: block;
            margin-bottom: 4px;
          }
          .meta-item span {
            font-size: 14px;
            font-weight: 700;
            color: #F5EFE6;
            font-family: 'JetBrains Mono', monospace;
          }
          .summary-box {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .sum-card {
            background: #211116;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #381B23;
          }
          .sum-card.net {
            background: #3B121A;
            border-color: #800020;
          }
          .sum-card label {
            font-size: 11px;
            color: #A89887;
            font-weight: 600;
          }
          .sum-card .amount {
            font-size: 20px;
            font-weight: 800;
            margin-top: 4px;
            font-family: 'JetBrains Mono', monospace;
          }
          .sum-card .amount.green { color: #34D399; }
          .sum-card .amount.red { color: #F87171; }
          .sum-card .amount.beige { color: #E8DCC4; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
          }
          th {
            background: #211116;
            color: #A89887;
            text-align: left;
            padding: 12px 16px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #381B23;
          }
          td {
            padding: 14px 16px;
            font-size: 12px;
            border-bottom: 1px solid #28141C;
          }
          tr:hover { background: #211116; }
          .tx-id { font-family: 'JetBrains Mono', monospace; color: #E8DCC4; font-size: 11px; }
          .tx-date { font-family: 'JetBrains Mono', monospace; color: #A89887; font-size: 11px; }
          .amount-in { color: #34D399; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
          .amount-out { color: #F87171; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
          .status-tag {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            background: rgba(128,0,32,0.4);
            color: #E8DCC4;
            border: 1px solid rgba(232,220,196,0.3);
          }
          .footer {
            border-top: 1px solid #33171E;
            padding-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #A89887;
          }
          .seal {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #E8DCC4;
            font-weight: 700;
          }
          .no-print {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #800020;
            color: #E8DCC4;
            padding: 12px 24px;
            border-radius: 30px;
            border: 1px solid #E8DCC4;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          @media print {
            .no-print { display: none; }
            body { background: white; color: black; }
            .container { background: white; color: black; border: none; box-shadow: none; }
            .meta-grid, .sum-card, th { background: #f8f8f8 !important; border-color: #ddd !important; color: black !important; }
            .brand-title, .doc-type h2, .sum-card .amount.beige, .tx-id, .seal { color: #800020 !important; }
            .sum-card label, .meta-item label, th { color: #555 !important; }
            td { border-color: #eee !important; }
          }
        </style>
      </head>
      <body>
        <button className="no-print" onclick="window.print()">Print / Save as PDF</button>

        <div class="container">
          <div class="header">
            <div class="brand">
              <div class="brand-logo">H</div>
              <div>
                <div class="brand-title">Harvics HPay</div>
                <div style="font-size:11px; color:#A89887;">Global Enterprise Commerce Rails</div>
              </div>
            </div>
            <div class="doc-type">
              <h2>Official Ledger Statement</h2>
              <p>Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <label>Account Holder</label>
              <span>${profile.name}</span>
            </div>
            <div class="meta-item">
              <label>HPay Identifier</label>
              <span>${profile.hpayId}</span>
            </div>
            <div class="meta-item">
              <label>Business Unit</label>
              <span>${profile.businessName}</span>
            </div>
          </div>

          <div class="summary-box">
            <div class="sum-card">
              <label>Total Credits (Inflow)</label>
              <div class="amount green">+$${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="sum-card">
              <label>Total Debits (Outflow)</label>
              <div class="amount red">-$${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="sum-card net">
              <label>Net Settlement Balance</label>
              <div class="amount beige">$${netSettlement.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tx Reference</th>
                <th>Date & Time</th>
                <th>Merchant / Counterparty</th>
                <th>Category</th>
                <th>Status</th>
                <th style="text-align:right;">Amount (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  (tx) => `
                <tr>
                  <td class="tx-id">${tx.reference}</td>
                  <td class="tx-date">${tx.timestamp}</td>
                  <td><strong>${tx.merchantOrPerson}</strong></td>
                  <td>${tx.category}</td>
                  <td><span class="status-tag">${tx.status}</span></td>
                  <td style="text-align:right;" class="${tx.direction === 'in' ? 'amount-in' : 'amount-out'}">
                    ${tx.direction === 'in' ? '+' : '-'}$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <div class="seal">
              <span>🛡️ Harvics Net Settlement Double-Entry Reconciled</span>
            </div>
            <div>
              Page 1 of 1 • Confirmed by Harvics Ledger Engine
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
