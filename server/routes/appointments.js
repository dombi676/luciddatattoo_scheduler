const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create booking link
router.post('/create-link', authenticateToken, [
  body('tattooDescription').notEmpty().trim(),
  body('durationMinutes').isInt({ min: 15, max: 480 }) // 15 mins to 8 hours
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tattooDescription, durationMinutes } = req.body;
    const token = uuidv4();
    const expiresAt = moment().add(24, 'hours').toISOString(); // Link expires in 24 hours

    const result = await db.query(
      `INSERT INTO booking_links (user_id, token, tattoo_description, duration_minutes, expires_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, token`,
      [req.user.id, token, tattooDescription, durationMinutes, expiresAt]
    );

    const bookingUrl = `${process.env.MAIN_WEBSITE_URL}/book/${token}`;

    res.status(201).json({ 
      id: result.rows[0].id,
      token: result.rows[0].token,
      bookingUrl,
      expiresAt
    });
  } catch (error) {
    console.error('Create booking link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming appointments
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, client_name, client_email, tattoo_description, 
              appointment_date, start_time, end_time, duration_minutes, status
       FROM appointments 
       WHERE user_id = $1 AND appointment_date >= CURRENT_DATE
       ORDER BY appointment_date, start_time`,
      [req.user.id]
    );

    // Group by date
    const appointmentsByDate = {};
    result.rows.forEach(appointment => {
      const date = appointment.appointment_date;
      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = [];
      }
      appointmentsByDate[date].push(appointment);
    });

    res.json({ appointments: appointmentsByDate });
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE appointments 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
