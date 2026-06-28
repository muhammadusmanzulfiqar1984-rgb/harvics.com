import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, DollarSign, Building2, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, db, auth, Timestamp, handleFirestoreError, OperationType } from '../firebase';

export const AddTransactionModal = ({ onClose, onAdded }: { onClose: () => void, onAdded?: () => void }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('LC');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Ready');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    
    setIsSubmitting(true);
    try {
      let color = 'text-emerald-600';
      if (status === 'Active') color = 'text-blue-600';
      if (status === 'Matching') color = 'text-amber-600';
      if (status === 'Pending') color = 'text-rose-600';

      await addDoc(collection(db, 'settlements'), {
        name,
        type,
        amount,
        status,
        color,
        authorUid: auth.currentUser?.uid,
        createdAt: Timestamp.now()
      });
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'settlements');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-harvics-maroon/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-harvics-maroon/10"
      >
        <div className="p-4 border-b border-harvics-maroon/5 flex justify-between items-center bg-harvics-maroon/5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 maroon-text" />
            <h2 className="text-sm font-bold uppercase tracking-widest maroon-text">New Transaction</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-harvics-maroon/5 rounded-full transition-colors">
            <X className="w-5 h-5 maroon-text opacity-50" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Counterparty / Supplier Name</label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
                placeholder="e.g. Pret A Manger Supply Chain"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Payment Type</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
              >
                <option value="LC">Letter of Credit (LC)</option>
                <option value="TT">Telegraphic Transfer (TT)</option>
                <option value="USDT Rail">USDT Rail (Crypto)</option>
                <option value="3-Way Match">3-Way Match</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Amount (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
                  placeholder="184,000"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Status</label>
            <select 
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
            >
              <option value="Ready">Ready</option>
              <option value="Active">Active</option>
              <option value="Matching">Matching</option>
              <option value="Settled">Settled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="mt-4 w-full py-3 bg-harvics-maroon text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-harvics-maroon/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create Transaction
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
