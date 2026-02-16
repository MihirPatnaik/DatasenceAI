// src/smartsocial/components/ui/use-toast.ts

export { useToast } from "./toast";

/*import * as React from "react";
import { ToastProps, ToastActionElement } from "./toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// For the standalone useToast implementation (if needed)
const createStandaloneToast = () => {
  let toasts: ToasterToast[] = [];
  const listeners: ((toasts: ToasterToast[]) => void)[] = [];
  
  const notify = (listener: (toasts: ToasterToast[]) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  };
  
  const update = () => {
    listeners.forEach(listener => listener([...toasts]));
  };
  
  const toast = (props: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { ...props, id };
    
    toasts = [toast, ...toasts].slice(0, 5); // Limit to 5 toasts
    
    update();
    
    const dismiss = () => {
      toasts = toasts.filter(t => t.id !== id);
      update();
    };
    
    // Auto-dismiss after 5 seconds unless duration is 0
    if (props.duration !== 0) {
      setTimeout(dismiss, props.duration || 5000);
    }
    
    return {
      id,
      dismiss,
      update: (newProps: Partial<ToasterToast>) => {
        toasts = toasts.map(t => t.id === id ? { ...t, ...newProps } : t);
        update();
      }
    };
  };
  
  return { toast, notify };
};

// Create standalone instance
const standaloneToast = createStandaloneToast();

// Hook for components that can't use context
export const useStandaloneToast = () => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  
  React.useEffect(() => {
    return standaloneToast.notify(setToasts);
  }, []);
  
  return {
    toasts,
    toast: standaloneToast.toast,
  };
};

// For backward compatibility
export const toast = standaloneToast.toast;
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);
  
  React.useEffect(() => {
    return standaloneToast.notify(setToasts);
  }, []);
  
  return {
    toasts,
    toast: standaloneToast.toast,
  };
};*/