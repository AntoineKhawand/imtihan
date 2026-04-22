"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // in ms, default 3000
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, toasts[0].duration);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto max-w-xs",
                {
                  'bg-emerald-50 border border-emerald-200 text-emerald-800': toast.type === 'success',
                  'bg-red-50 border border-red-200 text-red-800': toast.type === 'error',
                  'bg-blue-50 border border-blue-200 text-blue-800': toast.type === 'info',
                  'bg-amber-50 border border-amber-200 text-amber-800': toast.type === 'warning',
                }
              )}
            >
              {toast.type === 'success' && <CheckCircle size={18} className="flex-shrink-0" />}
              {toast.type === 'error' && <XCircle size={18} className="flex-shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="flex-shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle size={18} className="flex-shrink-0" />}
              <span className="text-sm flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
                aria-label="Close toast"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};