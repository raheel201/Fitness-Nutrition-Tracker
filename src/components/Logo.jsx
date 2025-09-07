import React from 'react';

export default function Logo({ size = 'md', showText = true }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-teal-400 to-orange-500 rounded-lg shadow-lg`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-2/3 h-2/3 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-teal-400 ${textSizes[size]}`}>
          FitTracker
        </span>
      )}
    </div>
  );
}