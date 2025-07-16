import React, { useState } from 'react';
import moment from 'moment';

const Calendar = ({ availableDates, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());

  const startOfMonth = moment(currentMonth).startOf('month');
  const endOfMonth = moment(currentMonth).endOf('month');
  const startDate = moment(startOfMonth).startOf('week');
  const endDate = moment(endOfMonth).endOf('week');

  const dateFormat = "D";
  const monthFormat = "MMMM YYYY";

  const nextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month'));
  };

  const prevMonth = () => {
    // Don't allow going back before current month
    const prevMonthDate = moment(currentMonth).subtract(1, 'month');
    if (prevMonthDate.isSameOrAfter(moment().startOf('month'))) {
      setCurrentMonth(prevMonthDate);
    }
  };

  const days = [];
  let day = startDate.clone();

  while (day.isSameOrBefore(endDate, 'day')) {
    days.push(day.clone());
    day.add(1, 'day');
  }

  const isDateAvailable = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return availableDates.includes(dateStr);
  };

  const isDateInCurrentMonth = (date) => {
    return date.month() === currentMonth.month();
  };

  const isDateSelected = (date) => {
    return selectedDate && date.format('YYYY-MM-DD') === selectedDate;
  };

  const canGoBack = currentMonth.isAfter(moment().startOf('month'));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          disabled={!canGoBack}
          className={`p-2 rounded ${
            canGoBack 
              ? 'hover:bg-gray-100 text-gray-700' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold capitalize">
          {currentMonth.format(monthFormat)}
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 rounded hover:bg-gray-100 text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isAvailable = isDateAvailable(day);
          const isInCurrentMonth = isDateInCurrentMonth(day);
          const isSelected = isDateSelected(day);
          const isPast = day.isBefore(moment(), 'day');

          return (
            <button
              key={day.format('YYYY-MM-DD')}
              onClick={() => isAvailable && onDateSelect(day.format('YYYY-MM-DD'))}
              disabled={!isAvailable || isPast}
              className={`
                relative p-3 text-sm rounded-lg transition-colors
                ${!isInCurrentMonth ? 'text-gray-300' : ''}
                ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                ${isAvailable && !isPast && isInCurrentMonth
                  ? 'hover:bg-gray-100 cursor-pointer text-gray-900'
                  : ''
                }
                ${!isAvailable && isInCurrentMonth && !isPast
                  ? 'text-gray-400 cursor-not-allowed'
                  : ''
                }
                ${isSelected
                  ? 'bg-lucidda-black text-white'
                  : ''
                }
              `}
            >
              {day.format(dateFormat)}
              
              {/* Available indicator */}
              {isAvailable && !isSelected && isInCurrentMonth && !isPast && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Disponible
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-lucidda-black rounded-full mr-2"></div>
          Seleccionado
        </div>
      </div>
    </div>
  );
};

export default Calendar;
