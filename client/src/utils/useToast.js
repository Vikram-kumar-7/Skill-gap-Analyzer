import { useState, useCallback } from 'react';

/**
 * Lightweight toast notification system — no external dependency.
 * Usage: const { toasts, toast } = useToast();
 *        toast('Saved!', 'success');
 */
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
