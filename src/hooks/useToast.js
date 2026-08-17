import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    success: (msg) => context.addToast(msg, 'success'),
    error: (msg) => context.addToast(msg, 'error'),
    info: (msg) => context.addToast(msg, 'info'),
  };
}