import React from 'react';

const FootballIcon = ({ className = '' }: { className?: string }) => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 17l-4.21-1.81 1.61-4.83h5.2l1.61 4.83z" />
    <path d="M12 17v5" />
    <path d="M7.79 15.19L4 17" />
    <path d="M16.21 15.19L20 17" />
    <path d="M9.4 10.36L5.61 8" />
    <path d="M14.6 10.36L18.39 8" />
    <path d="M12 7V2" />
  </svg>
);

export default FootballIcon;
