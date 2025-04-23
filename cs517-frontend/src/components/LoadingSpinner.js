import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-md p-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      <p className="mt-4 text-gray-600">Processing candidates...</p>
      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
    </div>
  );
};

export default LoadingSpinner;