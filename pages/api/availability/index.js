import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { query } from '../../../lib/database';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Get working hours for the day
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const workingHoursResult = await query(
      'SELECT * FROM working_hours WHERE day_of_week = $1 AND is_working = true',
      [dayOfWeek]
    );

    if (workingHoursResult.rows.length === 0) {
      return NextResponse.json({
        availableSlots: [],
        message: 'Not working on this day'
      });
    }

    const workingHours = workingHoursResult.rows[0];

    // Check for day overrides
    const overrideResult = await query(
      'SELECT * FROM day_overrides WHERE date = $1',
      [date]
    );

    let startTime, endTime, isWorking = true;

    if (overrideResult.rows.length > 0) {
      const override = overrideResult.rows[0];
      if (!override.is_working) {
        return NextResponse.json({
          availableSlots: [],
          message: 'Not available on this day'
        });
      }
      startTime = override.start_time;
      endTime = override.end_time;
    } else {
      startTime = workingHours.start_time;
      endTime = workingHours.end_time;
    }

    // Get existing appointments for the day
    const appointmentsResult = await query(
      `SELECT start_time, duration_minutes 
       FROM appointments 
       WHERE DATE(start_time) = $1 
       AND status != 'cancelled'
       ORDER BY start_time`,
      [date]
    );

    const bookedSlots = appointmentsResult.rows;

    // Generate available time slots (30-minute intervals)
    const availableSlots = [];
    const slotDuration = 30; // minutes
    
    let currentTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    while (currentTime < endDateTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      
      if (slotEnd <= endDateTime) {
        // Check if this slot conflicts with any booked appointment
        const isConflict = bookedSlots.some(appointment => {
          const appointmentStart = new Date(appointment.start_time);
          const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration_minutes * 60000);
          
          return (currentTime < appointmentEnd && slotEnd > appointmentStart);
        });

        if (!isConflict) {
          availableSlots.push({
            start_time: currentTime.toISOString(),
            end_time: slotEnd.toISOString(),
            formatted_time: currentTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          });
        }
      }
      
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    return NextResponse.json({
      availableSlots,
      workingHours: {
        start_time: startTime,
        end_time: endTime
      }
    });

  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
