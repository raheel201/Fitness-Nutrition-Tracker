import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 bg-slate-900 bg-opacity-75" onClick={onClose} />
      <div className={`relative bg-slate-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full border border-slate-700 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}