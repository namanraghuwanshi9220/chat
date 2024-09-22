import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white bg-opacity-80">
      <div className="loader border-8 border-blue-300 border-t-8 border-t-blue-600 rounded-full w-16 h-16 animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
