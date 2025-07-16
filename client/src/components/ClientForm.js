import React from 'react';

const ClientForm = ({ clientData, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6">Datos del Cliente</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={clientData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lucidda-black focus:border-transparent"
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={clientData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lucidda-black focus:border-transparent"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DNI *
          </label>
          <input
            type="text"
            value={clientData.dni}
            onChange={(e) => onChange('dni', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lucidda-black focus:border-transparent"
            placeholder="12.345.678"
            required
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        * Campos obligatorios. Tus datos se utilizarán únicamente para confirmar tu cita.
      </p>
    </div>
  );
};

export default ClientForm;
