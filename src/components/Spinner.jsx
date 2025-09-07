import React from 'react';

export default function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center">
      <div className={`animate-spin rounded-full border-2 border-slate-600 border-t-teal-500 ${sizeClasses[size]}`} />
    </div>
  );
}