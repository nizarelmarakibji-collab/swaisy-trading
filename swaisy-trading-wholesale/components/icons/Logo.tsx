
import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 320 120"
    fill="none"
    {...props}
  >
    <text
      x="160"
      y="85"
      textAnchor="middle"
      fontFamily="Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
      fontWeight="900"
      fontSize="75"
      fill="#2563eb"
      stroke="#1e293b" 
      strokeWidth="2"
      letterSpacing="0.5"
      style={{ filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))' }}
    >
      SWAISY
    </text>
    
    <text
      x="160"
      y="112"
      textAnchor="middle"
      fontFamily="'Inter', 'Arial', sans-serif"
      fontWeight="800"
      fontSize="20"
      fill="#fb923c"
      letterSpacing="10"
    >
      TRADING
    </text>
  </svg>
);
