import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-dark-700 rounded-md ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
