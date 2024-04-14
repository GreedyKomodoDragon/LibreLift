import React from 'react';

type LoadingSpinnerProps = {
  size?: number;
};

export default function LoadingSpinner({ size = 12 }: LoadingSpinnerProps) {
  const borderWidth = 10; // Adjust border width proportionally
  return (
    <div
      className={`inline-block h-${size} w-${size} animate-spin rounded-full ${`border-[${borderWidth}px]`} border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.4s_linear_infinite]`}
      role="status"
    ></div>
  );
}
