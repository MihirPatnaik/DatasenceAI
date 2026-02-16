// src/smartsocial/components/ui/toast.tsx

import * as React from "react";
import { createPortal } from "react-dom";

/** Toast props */
export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number; // custom duration (ms)
  action?: React.ReactNode;
};

/** Context type */
type ToastContextType = {
  toast: (props: ToastProps) => { dismiss: () => void; update: (props: Partial<ToastProps>) => void };
  dismiss: (id: string) => void;
  toasts: ToastProps[];
};

// ✅ FIXED: Provide initial value to createContext
const ToastContext = React.createContext<ToastContextType>({
  toast: () => ({ dismiss: () => {}, update: () => {} }),
  dismiss: () => {},
  toasts: []
});

// Toast component for individual toast
const ToastItem: React.FC<ToastProps & { onRemove: (id: string) => void }> = ({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  action,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const timerRef = React.useRef<number>();

  React.useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Set up auto-dismiss
    if (duration > 0) {
      timerRef.current = window.setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(id!);
    }, 300); // Match CSS transition duration
  };

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (duration > 0) {
      timerRef.current = window.setTimeout(() => {
        handleDismiss();
      }, duration);
    }
  };

  return createPortal(
    <div
      className={[
        "fixed right-4 transform transition-all duration-300 z-50 max-w-sm",
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      ].join(" ")}
      style={{ bottom: `calc(4rem + ${document.querySelectorAll('[data-toast]').length * 4.5}rem)` }}
      data-toast
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={[
          "p-4 rounded-lg shadow-lg border",
          variant === "destructive"
            ? "bg-red-100 border-red-300 text-red-900" // Error/destructive style
            : "bg-green-100 border-green-300 text-green-900", // ✅ CHANGED: Success style (green background)
        ].join(" ")}
      >
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <div className="font-semibold text-sm flex items-center">
                {/* Success icon for default variant */}
                {variant !== "destructive" && (
                  <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {/* Error icon for destructive variant */}
                {variant === "destructive" && (
                  <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {title}
              </div>
            )}
            {description && (
              <div className="mt-1 text-sm opacity-90">{description}</div>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>,
    document.body
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const dismiss = (id: string) => {
    removeToast(id);
  };

  const toast = (props: ToastProps) => {
    const id = props.id || Date.now().toString();
    const toastData = { ...props, id };
    
    setToasts((prev) => [...prev, toastData]);

    return {
      dismiss: () => dismiss(id),
      update: (newProps: Partial<ToastProps>) => {
        setToasts((prev) => 
          prev.map(t => t.id === id ? { ...t, ...newProps } : t)
        );
      }
    };
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onRemove={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

export type ToastActionElement = React.ReactElement<any>;