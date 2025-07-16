import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-lucidda-gray flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-4 text-center">
        <h2 className="text-2xl font-bold text-lucidda-black mb-4">Página No Encontrada</h2>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o el enlace ha expirado.
        </p>
        <a 
          href="https://lucidda.tattoo" 
          className="bg-lucidda-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Ir al sitio web
        </a>
      </div>
    </div>
  );
};

export default NotFound;
