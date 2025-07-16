import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-lucidda-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lucidda-black mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
