import React from 'react';

const RedCardIcon = ({ className = '' }: { className?: string }) => (
  <svg 
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="transparent" />
    <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#464646" />
    <g transform="translate(5.000000, 5.000000)">
      <rect 
        fill="#F59E0B" 
        fillRule="nonzero" 
        x="0" 
        y="1" 
        width="8" 
        height="11" 
        rx="2" 
      />
      <rect 
        className="text-red-600"
        fill="currentColor"
        fillRule="nonzero" 
        x="3" 
        y="-2" 
        width="8" 
        height="11" 
        rx="2" 
      />
    </g>
  </svg>
);

export default RedCardIcon;
