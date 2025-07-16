const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get working hours
router.get('/working-hours', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, day_of_week, start_time, end_time, is_active 
       FROM working_hours 
       WHERE user_id = $1 
       ORDER BY day_of_week, start_time`,
      [req.user.id]
    );

    res.json({ workingHours: result.rows });
  } catch (error) {
    console.error('Get working hours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update working hours
router.put('/working-hours', authenticateToken, [
  body('workingHours').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workingHours } = req.body;

    // Start transaction
    await db.query('BEGIN');

    try {
      // Delete existing working hours
      await db.query('DELETE FROM working_hours WHERE user_id = $1', [req.user.id]);

      // Insert new working hours
      for (const wh of workingHours) {
        await db.query(
          `INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_active) 
           VALUES ($1, $2, $3, $4, $5)`,
          [req.user.id, wh.day_of_week, wh.start_time, wh.end_time, wh.is_active || true]
        );
      }

      await db.query('COMMIT');
      res.json({ message: 'Working hours updated successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Update working hours error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get availability overrides
router.get('/overrides', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, date, start_time, end_time, type, description 
       FROM availability_overrides 
       WHERE user_id = $1 AND date >= CURRENT_DATE
       ORDER BY date, start_time`,
      [req.user.id]
    );

    res.json({ overrides: result.rows });
  } catch (error) {
    console.error('Get overrides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add availability override
router.post('/overrides', authenticateToken, [
  body('date').isISO8601().toDate(),
  body('type').isIn(['unavailable', 'vacation', 'appointment']),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, start_time, end_time, type, description } = req.body;

    const result = await db.query(
      `INSERT INTO availability_overrides (user_id, date, start_time, end_time, type, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [req.user.id, date, start_time || null, end_time || null, type, description || null]
    );

    res.status(201).json({ 
      message: 'Override added successfully', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Add override error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete availability override
router.delete('/overrides/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM availability_overrides WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Override not found' });
    }

    res.json({ message: 'Override deleted successfully' });
  } catch (error) {
    console.error('Delete override error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
