import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Calendar from './Calendar';
import ClientForm from './ClientForm';
import ConfirmationModal from './ConfirmationModal';
import LoadingSpinner from './LoadingSpinner';

const BookingPage = () => {
  const { token } = useParams();
  const [bookingData, setBookingData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    dni: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: calendar, 3: confirmation

  useEffect(() => {
    loadBookingData();
  }, [token]);

  useEffect(() => {
    if (bookingData) {
      loadAvailableDates();
    }
  }, [bookingData]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/booking/${token}`);
      setBookingData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading booking data:', error);
      if (error.response?.status === 404) {
        setError('Link de reserva no encontrado');
      } else if (error.response?.status === 410) {
        setError(error.response.data.error);
      } else {
        setError('Error al cargar los datos de reserva');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async () => {
    try {
      const response = await axios.get(`/api/booking/${token}/available-dates`);
      setAvailableDates(response.data.availableDates);
    } catch (error) {
      console.error('Error loading available dates:', error);
      setError('Error al cargar fechas disponibles');
    }
  };

  const loadAvailableTimes = async (date) => {
    try {
      const response = await axios.get(`/api/booking/${token}/available-times/${date}`);
      setAvailableTimes(response.data.availableTimes);
    } catch (error) {
      console.error('Error loading available times:', error);
      setError('Error al cargar horarios disponibles');
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleClientDataChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return clientData.name.trim() && 
           clientData.email.trim() && 
           clientData.dni.trim() &&
           selectedDate && 
           selectedTime;
  };

  const handleConfirm = () => {
    if (isFormValid()) {
      setShowConfirmation(true);
    }
  };

  const handleFinalConfirm = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/booking/${token}/book`, {
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientDni: clientData.dni,
        appointmentDate: selectedDate,
        startTime: selectedTime
      });

      // Show success message
      setStep(3);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.response?.data?.error || 'Error al reservar la cita');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bookingData) {
    return <LoadingSpinner />;
  }

  if (error && !bookingData) {
    return (
      <div className="min-h-screen bg-lucidda-gray flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold text-lucidda-black mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a 
            href="https://lucidda.tattoo" 
            className="bg-lucidda-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Volver al sitio web
          </a>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-lucidda-gray flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-lucidda-black mb-2">¡Cita Confirmada!</h2>
            <p className="text-gray-600 mb-4">
              Tu cita ha sido reservada exitosamente para el{' '}
              <strong>{moment(selectedDate).format('dddd, DD/MM/YYYY')}</strong> a las{' '}
              <strong>{selectedTime}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Recibirás un email de confirmación con todos los detalles.
            </p>
          </div>
          <a 
            href="https://lucidda.tattoo" 
            className="bg-lucidda-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Volver al sitio web
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lucidda-gray">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-lucidda-black mb-2">LUCIDDA TATTOO</h1>
          <p className="text-gray-600">Jujuy, Argentina</p>
        </div>

        {/* Booking Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-lucidda-black mb-4">Reservar Cita</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600"><strong>Tatuaje:</strong> {bookingData.tattooDescription}</p>
            </div>
            <div>
              <p className="text-gray-600">
                <strong>Duración:</strong> {Math.floor(bookingData.durationMinutes / 60)}h {bookingData.durationMinutes % 60}m
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Selecciona la fecha y hora que mejor te convenga
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client Form */}
          <ClientForm 
            clientData={clientData}
            onChange={handleClientDataChange}
          />

          {/* Calendar and Time Selection */}
          <div className="space-y-6">
            <Calendar 
              availableDates={availableDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />

            {selectedDate && availableTimes.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Horarios disponibles - {moment(selectedDate).format('dddd, DD/MM')}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-2 text-sm rounded border transition-colors ${
                        selectedTime === time
                          ? 'bg-lucidda-black text-white border-lucidda-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-lucidda-black'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && availableTimes.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <p className="text-gray-600 text-center">
                  No hay horarios disponibles para esta fecha
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        {isFormValid() && (
          <div className="text-center mt-8">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-lucidda-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar Cita'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        show={showConfirmation}
        bookingData={bookingData}
        clientData={clientData}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onConfirm={handleFinalConfirm}
        onCancel={() => setShowConfirmation(false)}
        loading={loading}
      />
    </div>
  );
};

export default BookingPage;
