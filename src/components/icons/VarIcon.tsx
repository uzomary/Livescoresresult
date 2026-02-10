import React from 'react';

const VarIcon = ({ className = '' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Screen outline */}
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />

    {/* VAR Text - Using simple paths for letters to ensure rendering without fonts */}
    <path d="M7 7l1.5 6 1.5-6" /> {/* V */}
    <path d="M11.5 13l0.5-6 2 0 0.5 6m-2-2.5h-1" /> {/* A */}
    <path d="M16 7h2a1.5 1.5 0 0 1 0 3h-2v3m2-3l1.5 3" /> {/* R */}
  </svg>
);

export default VarIcon;
