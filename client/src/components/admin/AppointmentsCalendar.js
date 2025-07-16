import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const AppointmentsCalendar = () => {
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments/upcoming');
      setAppointments(response.data.appointments);
      setError('');
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Estás segura de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      await axios.put(`/api/appointments/${appointmentId}/cancel`);
      await loadAppointments(); // Reload appointments
    } catch (error) {
      console.error('Error canceling appointment:', error);
      setError('Error al cancelar la cita');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lucidda-black"></div>
      </div>
    );
  }

  const appointmentDates = Object.keys(appointments).sort();
  const upcomingCount = appointmentDates.reduce((sum, date) => sum + appointments[date].length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Próximas Citas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {upcomingCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Esta Semana
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointmentDates.filter(date => 
                      moment(date).isBetween(moment().startOf('week'), moment().endOf('week'), 'day', '[]')
                    ).reduce((sum, date) => sum + appointments[date].length, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hoy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments[moment().format('YYYY-MM-DD')]?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Próximas Citas
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Todas tus citas confirmadas ordenadas por fecha
          </p>
        </div>
        
        {appointmentDates.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tienes citas programadas próximamente.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {appointmentDates.map(date => (
              <li key={date} className="px-4 py-4 sm:px-6">
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {moment(date).format('dddd, DD/MM/YYYY')}
                  </h4>
                </div>
                <div className="space-y-3">
                  {appointments[date].map(appointment => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-lucidda-black flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {appointment.clientName}
                              </p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {appointment.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                              <div className="flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                {appointment.clientEmail}
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              <strong>Tatuaje:</strong> {appointment.tattooDescription}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              <strong>DNI:</strong> {appointment.clientDni} • 
                              <strong> Duración:</strong> {Math.floor(appointment.durationMinutes / 60)}h {appointment.durationMinutes % 60}m
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={`https://wa.me/${appointment.clientPhone?.replace(/\D/g, '') || ''}?text=Hola ${appointment.clientName}, te contacto sobre tu cita del ${moment(date).format('DD/MM/YYYY')} a las ${appointment.startTime}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            WhatsApp
                          </a>
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AppointmentsCalendar;
