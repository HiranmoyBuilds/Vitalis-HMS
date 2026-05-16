import React, { useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
            onClick={onClose}
          ></motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh] border border-white/10`}
          >
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 dark:border-dark-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-dark-900/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-600/20">
                    <Shield className="w-4 h-4" />
                 </div>
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-700 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-8 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>

            {/* Footer Tag */}
            <div className="px-8 py-3 bg-slate-50/50 dark:bg-dark-900/50 border-t border-slate-50 dark:border-dark-700/50 text-center">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vitalis Secure Transaction Protocol v2.4</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
