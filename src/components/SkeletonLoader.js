// src/components/SkeletonLoader.js
import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      {Array(6).fill('').map((_, index) => (
        <div key={index} className="flex space-x-4">
          <div className="bg-gray-300 h-8 w-8 rounded-full"></div>
          <div className="flex-1 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
