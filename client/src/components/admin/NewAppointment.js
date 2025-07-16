import React, { useState } from 'react';
import axios from 'axios';
import { 
  PlusIcon,
  LinkIcon,
  ShareIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const NewAppointment = () => {
  const [formData, setFormData] = useState({
    tattooDescription: '',
    durationMinutes: 120
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingLink, setBookingLink] = useState(null);

  const durationOptions = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 min' },
    { value: 120, label: '2 horas' },
    { value: 180, label: '3 horas' },
    { value: 240, label: '4 horas' },
    { value: 300, label: '5 horas' },
    { value: 360, label: '6 horas' },
    { value: 420, label: '7 horas' },
    { value: 480, label: '8 horas' },
  ];

  const handleChange = (e) => {
    const value = e.target.name === 'durationMinutes' 
      ? parseInt(e.target.value) 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBookingLink(null);

    try {
      const response = await axios.post('/api/appointments/create-link', formData);
      setBookingLink(response.data);
      
      // Reset form
      setFormData({
        tattooDescription: '',
        durationMinutes: 120
      });
    } catch (error) {
      console.error('Error creating booking link:', error);
      setError(error.response?.data?.error || 'Error al crear el link de reserva');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Link copiado al portapapeles!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copiado al portapapeles!');
    }
  };

  const shareViaWhatsApp = (url, description) => {
    const message = `Hola! Te envío el link para que reserves tu cita para el tatuaje: ${description}\n\n${url}\n\nEl link expira en 24 horas, así que no te olvides de reservar tu horario preferido. ¡Nos vemos pronto! 🖤`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Crear Nueva Cita
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tattooDescription" className="block text-sm font-medium text-gray-700">
                Descripción del Tatuaje *
              </label>
              <div className="mt-1">
                <textarea
                  id="tattooDescription"
                  name="tattooDescription"
                  rows={4}
                  required
                  value={formData.tattooDescription}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-lucidda-black focus:border-lucidda-black block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ej: Rosa pequeña en la muñeca con detalles en negro"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Describe el tatuaje que vas a hacer. Esta información aparecerá en el link de reserva.
              </p>
            </div>

            <div>
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700">
                Duración Estimada *
              </label>
              <select
                id="durationMinutes"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lucidda-black focus:border-lucidda-black sm:text-sm rounded-md"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Selecciona cuánto tiempo necesitas para completar este tatuaje.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.tattooDescription.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lucidda-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lucidda-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {loading ? 'Generando...' : 'Generar Link de Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success - Show generated link */}
      {bookingLink && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <LinkIcon className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                ¡Link Generado Exitosamente!
              </h3>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 mb-2">
                <strong>Link de reserva:</strong>
              </p>
              <div className="bg-white border border-green-200 rounded p-3 mb-3">
                <code className="text-sm text-gray-800 break-all">
                  {bookingLink.bookingUrl}
                </code>
              </div>
              <p className="text-xs text-green-700">
                ⏰ Este link expira en 24 horas • Una vez usado no se puede reutilizar
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => copyToClipboard(bookingLink.bookingUrl)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lucidda-black"
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                Copiar Link
              </button>
              
              <button
                onClick={() => shareViaWhatsApp(bookingLink.bookingUrl, formData.tattooDescription)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Enviar por WhatsApp
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Próximos pasos:</strong>
              </p>
              <ol className="text-sm text-yellow-700 mt-1 ml-4 list-decimal">
                <li>Copia el link o envíalo directamente por WhatsApp</li>
                <li>El cliente recibirá una confirmación por email al reservar</li>
                <li>Tú recibirás una notificación cuando se haga la reserva</li>
                <li>La cita aparecerá automáticamente en tu calendario</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAppointment;
