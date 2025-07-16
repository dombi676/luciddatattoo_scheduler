import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import WorkingHours from './WorkingHours';
import NewAppointment from './NewAppointment';
import AppointmentsCalendar from './AppointmentsCalendar';
import { 
  ClockIcon, 
  PlusIcon, 
  CalendarIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const { user, logout } = useContext(AuthContext);

  const tabs = [
    { id: 'calendar', name: 'Calendario', icon: CalendarIcon },
    { id: 'new-appointment', name: 'Nueva Cita', icon: PlusIcon },
    { id: 'working-hours', name: 'Horarios', icon: ClockIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'working-hours':
        return <WorkingHours />;
      case 'new-appointment':
        return <NewAppointment />;
      case 'calendar':
      default:
        return <AppointmentsCalendar />;
    }
  };

  return (
    <div className="min-h-screen bg-lucidda-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-lucidda-black">LUCIDDA TATTOO</h1>
              <p className="text-sm text-gray-600">Panel de Administración</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hola, <strong>{user?.name}</strong>
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lucidda-black"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-lucidda-black text-lucidda-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Mobile-friendly bottom notice */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-lucidda-black text-white p-3 rounded-lg text-sm text-center">
        💡 Tip: Agrega esta página a tu pantalla de inicio para acceso rápido
      </div>
    </div>
  );
};

export default AdminDashboard;
