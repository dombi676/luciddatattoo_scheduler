import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const WorkingHours = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddOverride, setShowAddOverride] = useState(false);

  const daysOfWeek = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hoursResponse, overridesResponse] = await Promise.all([
        axios.get('/api/availability/working-hours'),
        axios.get('/api/availability/overrides')
      ]);
      
      setWorkingHours(hoursResponse.data.workingHours);
      setOverrides(overridesResponse.data.overrides);
      setError('');
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkingHours = async () => {
    try {
      setSaving(true);
      await axios.put('/api/availability/working-hours', { workingHours });
      setError('');
      alert('Horarios guardados exitosamente!');
    } catch (error) {
      console.error('Error saving working hours:', error);
      setError('Error al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  const addWorkingHour = (dayOfWeek) => {
    const newHour = {
      id: Date.now(), // Temporary ID
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_active: true
    };
    setWorkingHours([...workingHours, newHour]);
  };

  const updateWorkingHour = (id, field, value) => {
    setWorkingHours(workingHours.map(hour => 
      hour.id === id ? { ...hour, [field]: value } : hour
    ));
  };

  const deleteWorkingHour = (id) => {
    setWorkingHours(workingHours.filter(hour => hour.id !== id));
  };

  const deleteOverride = async (overrideId) => {
    if (!window.confirm('¿Estás segura de que quieres eliminar esta excepción?')) {
      return;
    }

    try {
      await axios.delete(`/api/availability/overrides/${overrideId}`);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting override:', error);
      setError('Error al eliminar la excepción');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lucidda-black"></div>
      </div>
    );
  }

  const getWorkingHoursForDay = (dayOfWeek) => {
    return workingHours.filter(hour => hour.day_of_week === dayOfWeek);
  };

  return (
    <div className="space-y-6">
      {/* Working Hours Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Horarios de Trabajo
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Define tus horarios disponibles para cada día de la semana
              </p>
            </div>
            <button
              onClick={saveWorkingHours}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-lucidda-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lucidda-black disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Horarios'}
            </button>
          </div>

          <div className="space-y-4">
            {daysOfWeek.map(day => {
              const dayHours = getWorkingHoursForDay(day.id);
              return (
                <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">{day.name}</h4>
                    <button
                      onClick={() => addWorkingHour(day.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Agregar Horario
                    </button>
                  </div>
                  
                  {dayHours.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay horarios configurados</p>
                  ) : (
                    <div className="space-y-2">
                      {dayHours.map(hour => (
                        <div key={hour.id} className="flex items-center space-x-3">
                          <input
                            type="time"
                            value={hour.start_time}
                            onChange={(e) => updateWorkingHour(hour.id, 'start_time', e.target.value)}
                            className="block w-32 px-3 py-1 text-sm border-gray-300 rounded-md focus:ring-lucidda-black focus:border-lucidda-black"
                          />
                          <span className="text-gray-500">a</span>
                          <input
                            type="time"
                            value={hour.end_time}
                            onChange={(e) => updateWorkingHour(hour.id, 'end_time', e.target.value)}
                            className="block w-32 px-3 py-1 text-sm border-gray-300 rounded-md focus:ring-lucidda-black focus:border-lucidda-black"
                          />
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={hour.is_active}
                              onChange={(e) => updateWorkingHour(hour.id, 'is_active', e.target.checked)}
                              className="rounded border-gray-300 text-lucidda-black focus:ring-lucidda-black"
                            />
                            <span className="ml-2 text-sm text-gray-600">Activo</span>
                          </label>
                          <button
                            onClick={() => deleteWorkingHour(hour.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Availability Overrides Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Excepciones de Disponibilidad
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Vacaciones, citas médicas, u otros días/horarios no disponibles
              </p>
            </div>
            <button
              onClick={() => setShowAddOverride(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lucidda-black"
            >
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Agregar Excepción
            </button>
          </div>

          {overrides.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay excepciones</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes excepciones de disponibilidad configuradas.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overrides.map(override => (
                <div key={override.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(override.date).toLocaleDateString('es-AR')}
                      {override.start_time && override.end_time && (
                        <span className="ml-2 text-gray-600">
                          {override.start_time} - {override.end_time}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {override.description || 'Sin descripción'}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      override.type === 'vacation' ? 'bg-blue-100 text-blue-800' :
                      override.type === 'appointment' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {override.type === 'vacation' ? 'Vacaciones' :
                       override.type === 'appointment' ? 'Cita Personal' :
                       'No Disponible'}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteOverride(override.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Override Modal would go here */}
      {showAddOverride && (
        <AddOverrideModal 
          onClose={() => setShowAddOverride(false)}
          onSave={() => {
            setShowAddOverride(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

// Simple modal component for adding overrides
const AddOverrideModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    type: 'unavailable',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post('/api/availability/overrides', formData);
      onSave();
    } catch (error) {
      console.error('Error adding override:', error);
      alert('Error al agregar la excepción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Excepción</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-lucidda-black focus:border-lucidda-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora inicio</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-lucidda-black focus:border-lucidda-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hora fin</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-lucidda-black focus:border-lucidda-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-lucidda-black focus:border-lucidda-black"
            >
              <option value="unavailable">No Disponible</option>
              <option value="vacation">Vacaciones</option>
              <option value="appointment">Cita Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-lucidda-black focus:border-lucidda-black"
              placeholder="Opcional"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lucidda-black hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkingHours;
