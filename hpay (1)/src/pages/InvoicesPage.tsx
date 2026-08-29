import React, { useState } from 'react';
import { useHPay } from '../context/HPayContext';
import { Invoice } from '../types';
import { FileText, Plus, CheckCircle2, Clock, AlertTriangle, Download, X, Send, Archive, CheckSquare, Square, Layers, ShieldCheck } from 'lucide-react';
import { BiometricOverlay } from '../components/common/BiometricOverlay';

export const InvoicesPage: React.FC = () => {
  const { invoices, createInvoice, addToast } = useHPay();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);

  // Batch Processing State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);
  const [pendingBatchAction, setPendingBatchAction] = useState<'send' | 'archive' | 'export' | null>(null);

  // Form
  const [customerName, setCustomerName] = useState('Emirates Enterprise Corp');
  const [customerEmail, setCustomerEmail] = useState('billing@emiratesent.ae');
  const [dueDate, setDueDate] = useState('2026-08-30');
  const [itemDesc, setItemDesc] = useState('HPay Enterprise API Integration & Support');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(5500);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map((inv) => inv.id));
    }
  };

  const totalSelectedAmount = invoices
    .filter((inv) => selectedIds.includes(inv.id))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleTriggerBatchAction = (action: 'send' | 'archive' | 'export') => {
    if (selectedIds.length === 0) return;
    setPendingBatchAction(action);
    // If total batch value > $10,000, trigger Biometric Security Check
    if (totalSelectedAmount > 10000 || action === 'archive') {
      setIsBiometricOpen(true);
    } else {
      executeBatchAction(action);
    }
  };

  const executeBatchAction = (action: 'send' | 'archive' | 'export') => {
    const count = selectedIds.length;
    if (action === 'send') {
      addToast('Batch Invoices Sent!', `Dispatched ${count} invoices totaling $${totalSelectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`);
    } else if (action === 'archive') {
      addToast('Invoices Archived', `Archived ${count} selected invoices to cold ledger.`);
    } else if (action === 'export') {
      addToast('Batch Export Complete', `Generated bulk CSV statement for ${count} invoices.`);
    }
    setSelectedIds([]);
    setIsBiometricOpen(false);
    setPendingBatchAction(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const items = [
      {
        id: Math.random().toString(),
        description: itemDesc,
        quantity: itemQty,
        unitPrice: itemPrice,
        taxPct: 0,
        discount: 0,
        total: itemQty * itemPrice
      }
    ];
    createInvoice(customerName, customerEmail, items, dueDate);
    setIsCreating(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <BiometricOverlay
        isOpen={isBiometricOpen}
        title="Biometric Batch Authorization"
        subtitle={`Verifying hardware passkey to execute bulk ${pendingBatchAction?.toUpperCase()} on ${selectedIds.length} invoices`}
        amount={`$${totalSelectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        recipient={`${selectedIds.length} B2B Enterprise Recipients`}
        onSuccess={() => pendingBatchAction && executeBatchAction(pendingBatchAction)}
        onCancel={() => {
          setIsBiometricOpen(false);
          setPendingBatchAction(null);
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Invoice Management</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Automated commercial invoicing, batch operations & direct settlement</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg border border-[#E8DCC4]/20"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Batch Processing Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#211116] border border-[#800020] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8DCC4]">
            <CheckSquare className="w-4 h-4 text-[#E8DCC4]" />
            <span>{selectedIds.length} Invoice(s) Selected</span>
            <span className="text-white font-mono">
              (Total: ${totalSelectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTriggerBatchAction('send')}
              className="px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] text-xs font-bold transition-all flex items-center gap-1.5 border border-[#E8DCC4]/20"
            >
              <Send className="w-3.5 h-3.5" /> Bulk Send
            </button>
            <button
              onClick={() => handleTriggerBatchAction('export')}
              className="px-3.5 py-2 rounded-xl bg-[#180C10] hover:bg-[#2B141B] text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-[#381B23]"
            >
              <Download className="w-3.5 h-3.5 text-[#E8DCC4]" /> Bulk Export
            </button>
            <button
              onClick={() => handleTriggerBatchAction('archive')}
              className="px-3.5 py-2 rounded-xl bg-[#2B141B] hover:bg-[#3B121A] text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-[#422028]"
            >
              <Archive className="w-3.5 h-3.5" /> Bulk Archive
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 text-[#A89887] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Invoice List */}
        <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2B141B]">
            <h2 className="text-xs font-bold text-[#A89887] uppercase tracking-wider">All Invoices</h2>
            <button
              onClick={toggleSelectAll}
              className="text-xs font-bold text-[#E8DCC4] hover:underline flex items-center gap-1"
            >
              {selectedIds.length === invoices.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Deselect All
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" /> Select All ({invoices.length})
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {invoices.map((inv) => {
              const isChecked = selectedIds.includes(inv.id);
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3 ${
                    selectedInvoice?.id === inv.id
                      ? 'bg-[#211116] border-[#800020] shadow-md'
                      : 'bg-[#180C10] border-[#2B141B] hover:border-[#422028]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleSelect(inv.id, e)}
                    className="mt-0.5 text-[#A89887] hover:text-[#E8DCC4] transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#E8DCC4]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#A89887]" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-[#E8DCC4]">{inv.invoiceNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400' : inv.status === 'Overdue' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">{inv.customerName}</div>
                    <div className="flex items-center justify-between text-xs text-[#A89887] font-mono mt-2 pt-2 border-t border-[#2B141B]">
                      <span>Due: {inv.dueDate}</span>
                      <span className="font-bold text-white">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Invoice High-Fidelity Preview */}
        <div className="lg:col-span-2">
          {selectedInvoice ? (
            <div className="rounded-3xl bg-[#180C10] border border-[#33171E] p-8 space-y-6 text-white">
              {/* Invoice Document Box */}
              <div className="p-8 rounded-2xl bg-white text-black space-y-6 shadow-2xl">
                <div className="flex justify-between items-start border-b pb-6">
                  <div>
                    <h2 className="text-2xl font-black tracking-wider text-black font-sans">Harvics Global Ventures</h2>
                    <p className="text-xs text-gray-500 font-medium">HPay Enterprise Merchant Platform</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-gray-400 uppercase block">INVOICE</span>
                    <span className="text-xl font-mono font-extrabold text-black">{selectedInvoice.invoiceNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block uppercase">Billed To:</span>
                    <span className="font-bold text-sm text-black block mt-0.5">{selectedInvoice.customerName}</span>
                    <span className="text-gray-600">{selectedInvoice.customerEmail}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-bold block uppercase">Dates:</span>
                    <span className="text-gray-600 block mt-0.5">Issued: {selectedInvoice.issueDate}</span>
                    <span className="text-gray-900 font-bold block">Due: {selectedInvoice.dueDate}</span>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs font-mono border-t border-b">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-800">
                    {selectedInvoice.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-3 font-sans font-medium">{it.description}</td>
                        <td className="py-3 text-center">{it.quantity}</td>
                        <td className="py-3 text-right">${it.unitPrice.toLocaleString()}</td>
                        <td className="py-3 text-right font-bold">${it.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-xs text-gray-500 font-mono">
                    Status: <span className="font-bold text-black uppercase">{selectedInvoice.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-bold uppercase block">Total Amount Due</span>
                    <span className="text-2xl font-black font-mono text-black">${selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-3">
                <button
                  onClick={() => addToast('Invoice Sent', `Invoice ${selectedInvoice.invoiceNumber} emailed to ${selectedInvoice.customerEmail}`)}
                  className="flex-1 py-3 rounded-xl bg-[#800020] hover:bg-[#990026] text-[#E8DCC4] font-extrabold text-xs flex items-center justify-center gap-2 border border-[#E8DCC4]/20"
                >
                  <Send className="w-4 h-4" /> Send Payment Reminder
                </button>
                <button
                  onClick={() => addToast('PDF Downloaded', `Saved ${selectedInvoice.invoiceNumber}.pdf`)}
                  className="py-3 px-5 rounded-xl bg-[#211116] text-white font-bold text-xs hover:bg-[#2B141B] flex items-center gap-2 border border-[#381B23]"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">Select an invoice to preview</div>
          )}
        </div>
      </div>

      {/* Modal for Creating Invoice */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#10141D] border border-[#202738] w-full max-w-lg rounded-3xl p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b pb-3 border-[#1E2536]">
              <h3 className="font-bold text-sm">Create Commercial Invoice</h3>
              <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Customer Email</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Line Item Description</label>
              <input
                type="text"
                required
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  value={itemQty}
                  onChange={(e) => setItemQty(Number(e.target.value))}
                  className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Unit Price ($)</label>
                <input
                  type="number"
                  required
                  value={itemPrice}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#141A26] border border-[#232B3E] text-white px-3 py-2.5 rounded-xl text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs"
            >
              Issue Invoice Now
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
