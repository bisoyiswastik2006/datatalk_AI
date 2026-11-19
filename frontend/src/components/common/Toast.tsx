import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />,
            warning: <AlertTriangle className="w-4 h-4 text-warning-text shrink-0" aria-hidden="true" />,
            error: <AlertCircle className="w-4 h-4 text-error shrink-0" aria-hidden="true" />,
            info: <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />,
          };

          const bgMap = {
            success: 'bg-card border-border text-main',
            warning: 'bg-warning border-warning text-warning-text',
            error: 'bg-card border-error/50 text-main',
            info: 'bg-card border-border text-main',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl border shadow-card flex items-center justify-between gap-3 text-caption font-medium transition-all ${
                bgMap[toast.type || 'success']
              }`}
            >
              <div className="flex items-center gap-2.5">
                {iconMap[toast.type || 'success']}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="w-6 h-6 flex items-center justify-center rounded hover:opacity-75 cursor-pointer text-secondary"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

