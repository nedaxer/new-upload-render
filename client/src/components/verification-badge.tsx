import React from 'react';

interface VerificationBadgeProps {
  size?: number;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  size = 20, 
  className = "ml-2 inline-block" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`orangeGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#ff6600" />
        </linearGradient>
      </defs>
      <path 
        d="M50,5 C55,5 60,7 64,11 C68,7 73,5 78,8 C83,11 86,16 89,22 C95,22 100,27 100,33 C100,39 97,44 92,47 C95,53 95,60 89,66 C86,72 81,75 75,78 C75,84 70,89 64,89 C58,89 55,86 50,82 C45,86 42,89 36,89 C30,89 25,84 25,78 C19,75 14,72 11,66 C5,60 5,53 8,47 C3,44 0,39 0,33 C0,27 5,22 11,22 C14,16 17,11 22,8 C27,5 32,7 36,11 C40,7 45,5 50,5 Z" 
        fill={`url(#orangeGradient-${size})`}
      />
      <path 
        d="M35,45 L45,55 L65,35" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
    </svg>
  );
};

export default VerificationBadge;