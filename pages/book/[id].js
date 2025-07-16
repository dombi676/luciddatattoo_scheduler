import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function BookingPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [bookingLink, setBookingLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: form, 2: calendar, 3: confirmation
  
  // Form data
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Calendar data
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Booking
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookingLink();
    }
  }, [id]);

  const loadBookingLink = async () => {
    try {
      const response = await fetch(`/api/booking-links/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBookingLink(data.bookingLink);
      } else {
        const data = await response.json();
        setError(data.error || 'Booking link not found');
      }
    } catch (error) {
      setError('Failed to load booking link');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/availability?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    loadAvailableSlots(date);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBooking = async () => {
    if (!clientName || !clientEmail || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const response = await fetch(`/api/booking-links/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          start_time: selectedTime,
        }),
      });

      if (response.ok) {
        setConfirmed(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Booking failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // Generate calendar dates for next 30 days
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        isToday: i === 0
      });
    }
    
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !bookingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Link Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact the tattoo artist for a new booking link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
              <div className="text-left space-y-2">
                <p><strong>Name:</strong> {clientName}</p>
                <p><strong>Email:</strong> {clientEmail}</p>
                {clientPhone && <p><strong>Phone:</strong> {clientPhone}</p>}
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(selectedTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</p>
                <p><strong>Duration:</strong> {bookingLink?.duration_minutes} minutes</p>
                {bookingLink?.service_type && <p><strong>Service:</strong> {bookingLink.service_type}</p>}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              You should receive a confirmation email shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Book Appointment - Lucid Tattoo</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Book Your Appointment</h1>
            <p className="mt-2 text-gray-600">
              Duration: {bookingLink?.duration_minutes} minutes
            </p>
            {bookingLink?.service_type && (
              <p className="text-gray-600">Service: {bookingLink.service_type}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Client Information */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  disabled={!clientName || !clientEmail}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Date & Time
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date and Time Selection */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Select Date & Time</h2>
              
              {/* Calendar */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Choose a date:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {generateCalendarDates().map((dateObj) => (
                    <button
                      key={dateObj.date}
                      onClick={() => handleDateSelect(dateObj.date)}
                      className={`p-2 text-sm border rounded-md transition-colors ${
                        selectedDate === dateObj.date
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : dateObj.isToday
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {dateObj.display}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Available times:</h3>
                  {loadingSlots ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.start_time}
                          onClick={() => handleTimeSelect(slot.start_time)}
                          className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          {slot.formatted_time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No available times for this date</p>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setStep(1)}
                className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Confirm Your Appointment</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{clientEmail}</span>
                </div>
                {clientPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{clientPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {new Date(selectedTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{bookingLink?.duration_minutes} minutes</span>
                </div>
                {bookingLink?.service_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{bookingLink.service_type}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Booking...
                    </div>
                  ) : (
                    'Confirm Appointment'
                  )}
                </button>
                
                <button
                  onClick={() => setStep(2)}
                  disabled={booking}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
