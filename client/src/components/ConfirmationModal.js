import React from 'react';
import moment from 'moment';

const ConfirmationModal = ({ 
  show, 
  bookingData, 
  clientData, 
  selectedDate, 
  selectedTime, 
  onConfirm, 
  onCancel, 
  loading 
}) => {
  if (!show) return null;

  const endTime = moment(`${selectedDate} ${selectedTime}`, 'YYYY-MM-DD HH:mm')
    .add(bookingData.durationMinutes, 'minutes')
    .format('HH:mm');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-lucidda-black mb-4">
            Confirmar Reserva
          </h3>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Detalles de la Cita</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Fecha:</strong> {moment(selectedDate).format('dddd, DD/MM/YYYY')}</p>
                <p><strong>Hora:</strong> {selectedTime} - {endTime}</p>
                <p><strong>Duración:</strong> {Math.floor(bookingData.durationMinutes / 60)}h {bookingData.durationMinutes % 60}m</p>
                <p><strong>Tatuaje:</strong> {bookingData.tattooDescription}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Datos del Cliente</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {clientData.name}</p>
                <p><strong>Email:</strong> {clientData.email}</p>
                <p><strong>DNI:</strong> {clientData.dni}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>¡Importante!</strong> Esta acción no se puede deshacer. 
              Recibirás un email de confirmación y la artista será notificada inmediatamente.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-lucidda-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : 'Sí, confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
