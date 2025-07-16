const express = require('express');
const { body, validationResult } = require('express-validator');
const moment = require('moment-timezone');
const db = require('../config/database');
const { sendConfirmationEmail, sendNotificationToArtist } = require('../utils/notifications');

const router = express.Router();

// Get booking link details
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await db.query(
      `SELECT bl.id, bl.tattoo_description, bl.duration_minutes, bl.is_used, bl.expires_at,
              u.name as artist_name
       FROM booking_links bl
       JOIN users u ON bl.user_id = u.id
       WHERE bl.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    const booking = result.rows[0];

    // Check if link is expired
    if (moment().isAfter(moment(booking.expires_at))) {
      return res.status(410).json({ error: 'Booking link has expired' });
    }

    // Check if link is already used
    if (booking.is_used) {
      return res.status(410).json({ error: 'Booking link has already been used' });
    }

    res.json({
      tattooDescription: booking.tattoo_description,
      durationMinutes: booking.duration_minutes,
      artistName: booking.artist_name
    });
  } catch (error) {
    console.error('Get booking link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available dates for booking
router.get('/:token/available-dates', async (req, res) => {
  try {
    const { token } = req.params;
    const { month, year } = req.query;

    // Get booking details
    const bookingResult = await db.query(
      `SELECT bl.user_id, bl.duration_minutes, bl.is_used, bl.expires_at
       FROM booking_links bl
       WHERE bl.token = $1`,
      [token]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.is_used || moment().isAfter(moment(booking.expires_at))) {
      return res.status(410).json({ error: 'Booking link is no longer valid' });
    }

    const startDate = moment().tz('America/Argentina/Jujuy').startOf('day');
    const endDate = moment(startDate).add(2, 'months'); // Show 2 months ahead

    // Get working hours
    const workingHoursResult = await db.query(
      `SELECT day_of_week, start_time, end_time 
       FROM working_hours 
       WHERE user_id = $1 AND is_active = true`,
      [booking.user_id]
    );

    // Get availability overrides
    const overridesResult = await db.query(
      `SELECT date, start_time, end_time 
       FROM availability_overrides 
       WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
      [booking.user_id, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
    );

    // Get existing appointments
    const appointmentsResult = await db.query(
      `SELECT appointment_date, start_time, end_time 
       FROM appointments 
       WHERE user_id = $1 AND appointment_date BETWEEN $2 AND $3 AND status = 'confirmed'`,
      [booking.user_id, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
    );

    const availableDates = calculateAvailableDates(
      startDate,
      endDate,
      workingHoursResult.rows,
      overridesResult.rows,
      appointmentsResult.rows,
      booking.duration_minutes
    );

    res.json({ availableDates });
  } catch (error) {
    console.error('Get available dates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available time slots for a specific date
router.get('/:token/available-times/:date', async (req, res) => {
  try {
    const { token, date } = req.params;

    // Get booking details
    const bookingResult = await db.query(
      `SELECT bl.user_id, bl.duration_minutes, bl.is_used, bl.expires_at
       FROM booking_links bl
       WHERE bl.token = $1`,
      [token]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.is_used || moment().isAfter(moment(booking.expires_at))) {
      return res.status(410).json({ error: 'Booking link is no longer valid' });
    }

    const requestedDate = moment(date);
    const dayOfWeek = requestedDate.day();

    // Get working hours for this day
    const workingHoursResult = await db.query(
      `SELECT start_time, end_time 
       FROM working_hours 
       WHERE user_id = $1 AND day_of_week = $2 AND is_active = true`,
      [booking.user_id, dayOfWeek]
    );

    // Get availability overrides for this date
    const overridesResult = await db.query(
      `SELECT start_time, end_time 
       FROM availability_overrides 
       WHERE user_id = $1 AND date = $2`,
      [booking.user_id, date]
    );

    // Get existing appointments for this date
    const appointmentsResult = await db.query(
      `SELECT start_time, end_time 
       FROM appointments 
       WHERE user_id = $1 AND appointment_date = $2 AND status = 'confirmed'`,
      [booking.user_id, date]
    );

    const availableTimes = calculateAvailableTimesForDate(
      workingHoursResult.rows,
      overridesResult.rows,
      appointmentsResult.rows,
      booking.duration_minutes
    );

    res.json({ availableTimes });
  } catch (error) {
    console.error('Get available times error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Book appointment
router.post('/:token/book', [
  body('clientName').notEmpty().trim(),
  body('clientEmail').isEmail().normalizeEmail(),
  body('clientDni').notEmpty().trim(),
  body('appointmentDate').isISO8601(),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { clientName, clientEmail, clientDni, appointmentDate, startTime } = req.body;

    // Start transaction
    await db.query('BEGIN');

    try {
      // Get booking details
      const bookingResult = await db.query(
        `SELECT bl.id, bl.user_id, bl.tattoo_description, bl.duration_minutes, 
                bl.is_used, bl.expires_at
         FROM booking_links bl
         WHERE bl.token = $1 FOR UPDATE`,
        [token]
      );

      if (bookingResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ error: 'Booking link not found' });
      }

      const booking = bookingResult.rows[0];

      if (booking.is_used) {
        await db.query('ROLLBACK');
        return res.status(410).json({ error: 'Booking link has already been used' });
      }

      if (moment().isAfter(moment(booking.expires_at))) {
        await db.query('ROLLBACK');
        return res.status(410).json({ error: 'Booking link has expired' });
      }

      // Calculate end time
      const startMoment = moment(`${appointmentDate} ${startTime}`, 'YYYY-MM-DD HH:mm');
      const endMoment = moment(startMoment).add(booking.duration_minutes, 'minutes');
      const endTime = endMoment.format('HH:mm');

      // TODO: Verify time slot is still available (implement the same logic as available-times)

      // Create appointment
      const appointmentResult = await db.query(
        `INSERT INTO appointments 
         (user_id, booking_link_id, client_name, client_email, client_dni, 
          tattoo_description, appointment_date, start_time, end_time, duration_minutes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [booking.user_id, booking.id, clientName, clientEmail, clientDni,
         booking.tattoo_description, appointmentDate, startTime, endTime, booking.duration_minutes]
      );

      // Mark booking link as used
      await db.query(
        'UPDATE booking_links SET is_used = true WHERE id = $1',
        [booking.id]
      );

      await db.query('COMMIT');

      const appointmentId = appointmentResult.rows[0].id;

      // Send notifications (async, don't wait)
      setImmediate(async () => {
        try {
          await sendConfirmationEmail(clientEmail, {
            clientName,
            tattooDescription: booking.tattoo_description,
            appointmentDate,
            startTime,
            endTime,
            duration: booking.duration_minutes
          });

          await sendNotificationToArtist(booking.user_id, {
            clientName,
            tattooDescription: booking.tattoo_description,
            appointmentDate,
            startTime,
            clientEmail
          }, req.io);

          // Update appointment with notification timestamps
          await db.query(
            `UPDATE appointments 
             SET email_sent_at = CURRENT_TIMESTAMP, push_sent_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [appointmentId]
          );
        } catch (notificationError) {
          console.error('Notification error:', notificationError);
        }
      });

      res.status(201).json({ 
        message: 'Appointment booked successfully',
        appointmentId,
        appointmentDate,
        startTime,
        endTime
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculateAvailableDates(startDate, endDate, workingHours, overrides, appointments, durationMinutes) {
  const availableDates = [];
  const current = moment(startDate);

  while (current.isSameOrBefore(endDate)) {
    const dayOfWeek = current.day();
    const dateStr = current.format('YYYY-MM-DD');

    // Check if there are working hours for this day
    const dayWorkingHours = workingHours.filter(wh => wh.day_of_week === dayOfWeek);
    
    if (dayWorkingHours.length > 0) {
      // Check if day is not completely blocked by overrides
      const dayOverrides = overrides.filter(o => o.date === dateStr);
      const isCompletelyBlocked = dayOverrides.some(o => !o.start_time && !o.end_time);

      if (!isCompletelyBlocked) {
        // Check if there are any available time slots for this duration
        const availableTimes = calculateAvailableTimesForDate(
          dayWorkingHours, 
          dayOverrides, 
          appointments.filter(a => a.appointment_date === dateStr),
          durationMinutes
        );

        if (availableTimes.length > 0) {
          availableDates.push(dateStr);
        }
      }
    }

    current.add(1, 'day');
  }

  return availableDates;
}

function calculateAvailableTimesForDate(workingHours, overrides, appointments, durationMinutes) {
  const availableTimes = [];
  
  // If day is completely blocked
  const completelyBlocked = overrides.some(o => !o.start_time && !o.end_time);
  if (completelyBlocked) {
    return availableTimes;
  }

  for (const workingPeriod of workingHours) {
    const startTime = moment(workingPeriod.start_time, 'HH:mm');
    const endTime = moment(workingPeriod.end_time, 'HH:mm');
    
    // Generate 15-minute intervals
    const current = moment(startTime);
    while (current.clone().add(durationMinutes, 'minutes').isSameOrBefore(endTime)) {
      const slotStart = current.format('HH:mm');
      const slotEnd = current.clone().add(durationMinutes, 'minutes').format('HH:mm');

      // Check if this slot conflicts with any overrides
      const hasOverrideConflict = overrides.some(override => {
        if (!override.start_time || !override.end_time) return false;
        
        const overrideStart = moment(override.start_time, 'HH:mm');
        const overrideEnd = moment(override.end_time, 'HH:mm');
        
        return current.isBefore(overrideEnd) && 
               current.clone().add(durationMinutes, 'minutes').isAfter(overrideStart);
      });

      // Check if this slot conflicts with any appointments
      const hasAppointmentConflict = appointments.some(appointment => {
        const appStart = moment(appointment.start_time, 'HH:mm');
        const appEnd = moment(appointment.end_time, 'HH:mm');
        
        return current.isBefore(appEnd) && 
               current.clone().add(durationMinutes, 'minutes').isAfter(appStart);
      });

      if (!hasOverrideConflict && !hasAppointmentConflict) {
        availableTimes.push(slotStart);
      }

      current.add(15, 'minutes');
    }
  }

  return availableTimes;
}

module.exports = router;
