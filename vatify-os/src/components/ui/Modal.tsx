import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, description, children }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-maroon/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <Card className="p-0 overflow-hidden rounded-[2.5rem] border-brand-gold/20 shadow-2xl">
              <div className="p-8 border-b border-brand-gold/10 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif font-medium uppercase tracking-tight">{title}</h3>
                  {description && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-1">
                      {description}
                    </p>
                  )}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-brand-maroon/5 rounded-full transition-colors text-brand-gold"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                {children}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
