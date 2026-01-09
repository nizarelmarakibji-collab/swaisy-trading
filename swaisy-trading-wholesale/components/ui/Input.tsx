import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm ${className}`}
      {...props}
    />
  );
};