import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Truck, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, db, auth, Timestamp, handleFirestoreError, OperationType } from '../firebase';

export const AddShipmentModal = ({ onClose, onAdded }: { onClose: () => void, onAdded?: () => void }) => {
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('Green');
  const [details, setDetails] = useState('');
  const [eta, setEta] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !origin || !destination) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'shipments'), {
        name,
        route: `${origin} → ${destination}`,
        status,
        details,
        isGoverned: true,
        eta: eta ? new Date(eta).toISOString() : new Date().toISOString(),
        authorUid: auth.currentUser?.uid,
        createdAt: Timestamp.now()
      });
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'shipments');
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
            <Truck className="w-5 h-5 maroon-text" />
            <h2 className="text-sm font-bold uppercase tracking-widest maroon-text">New Shipment</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-harvics-maroon/5 rounded-full transition-colors">
            <X className="w-5 h-5 maroon-text opacity-50" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Vessel / Shipment Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
              placeholder="e.g. MSC AMALFI"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Origin</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  required
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
                  placeholder="Genoa, IT"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="text" 
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
                  placeholder="Jebel Ali, AE"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
              >
                <option value="Green">Green (Pre-cleared)</option>
                <option value="In Transit">In Transit</option>
                <option value="In Port">In Port</option>
                <option value="Customs Clearance">Customs Clearance</option>
                <option value="Delayed">Delayed</option>
                <option value="Correcting">Correcting</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">ETA</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  type="datetime-local" 
                  value={eta}
                  onChange={e => setEta(e.target.value)}
                  className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest maroon-text opacity-60">Cargo Details</label>
            <input 
              type="text" 
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full bg-harvics-maroon/5 border border-harvics-maroon/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-harvics-maroon/30"
              placeholder="e.g. Coffee, roasted [HS 0901.21]"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="mt-4 w-full py-3 bg-harvics-maroon text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-harvics-maroon/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Create Shipment
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
