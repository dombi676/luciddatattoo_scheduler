import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekAppointments: 0,
    monthAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/admin');
      }
    } catch (error) {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load recent appointments
      const appointmentsResponse = await fetch('/api/appointments');
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setRecentAppointments(appointmentsData.appointments.slice(0, 5));
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const todayCount = appointmentsData.appointments.filter(apt => 
          apt.start_time.split('T')[0] === today && apt.status !== 'cancelled'
        ).length;
        
        const weekCount = appointmentsData.appointments.filter(apt => 
          apt.start_time >= oneWeekAgo && apt.status !== 'cancelled'
        ).length;
        
        const monthCount = appointmentsData.appointments.filter(apt => 
          apt.start_time >= oneMonthAgo && apt.status !== 'cancelled'
        ).length;
        
        setStats({
          todayAppointments: todayCount,
          weekAppointments: weekCount,
          monthAppointments: monthCount
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - Lucid Tattoo Scheduler</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Lucid Tattoo Scheduler
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Today's Appointments
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.todayAppointments}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        This Week
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.weekAppointments}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        This Month
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.monthAppointments}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              href="/admin/appointments"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-indigo-600 text-2xl mb-2">📅</div>
              <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
              <p className="text-sm text-gray-500">View and manage appointments</p>
            </Link>

            <Link
              href="/admin/new-appointment"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-green-600 text-2xl mb-2">➕</div>
              <h3 className="text-lg font-medium text-gray-900">New Appointment</h3>
              <p className="text-sm text-gray-500">Schedule a new appointment</p>
            </Link>

            <Link
              href="/admin/working-hours"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-blue-600 text-2xl mb-2">🕒</div>
              <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
              <p className="text-sm text-gray-500">Set your availability</p>
            </Link>

            <Link
              href="/admin/booking-links"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center"
            >
              <div className="text-purple-600 text-2xl mb-2">🔗</div>
              <h3 className="text-lg font-medium text-gray-900">Booking Links</h3>
              <p className="text-sm text-gray-500">Create booking links</p>
            </Link>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Appointments
              </h3>
              {recentAppointments.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {appointment.client_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(appointment.start_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.duration_minutes} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
