import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const showSuccess = (message) => {
    toast.success(message, {
      style: {
        background: '#0f172a',
        color: '#f1f5f9',
        border: '1px solid #14b8a6',
      },
      iconTheme: {
        primary: '#14b8a6',
        secondary: '#f1f5f9',
      },
    });
  };

  const showError = (message) => {
    toast.error(message, {
      style: {
        background: '#0f172a',
        color: '#f1f5f9',
        border: '1px solid #ef4444',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#f1f5f9',
      },
    });
  };

  const showInfo = (message) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#0f172a',
        color: '#f1f5f9',
        border: '1px solid #3b82f6',
      },
    });
  };

  const value = {
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
          },
        }}
      />
    </ToastContext.Provider>
  );
}