import { NextResponse } from 'next/server';
import { verifyToken } from '../../../lib/auth';
import { query } from '../../../lib/database';

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { start_time, duration_minutes, service_type, notes, status } = await request.json();

    // Check if appointment exists
    const existingAppointment = await query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (existingAppointment.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // If updating time/duration, check for conflicts
    if (start_time || duration_minutes) {
      const newStartTime = start_time || existingAppointment.rows[0].start_time;
      const newDuration = duration_minutes || existingAppointment.rows[0].duration_minutes;

      const conflictCheck = await query(
        `SELECT id FROM appointments 
         WHERE id != $1
         AND start_time < $2 + interval '${newDuration} minutes' 
         AND start_time + interval '1 minute' * duration_minutes > $2
         AND status != 'cancelled'`,
        [id, newStartTime]
      );

      if (conflictCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Time slot conflicts with existing appointment' }, { status: 409 });
      }
    }

    // Update appointment
    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    if (start_time) {
      updateFields.push(`start_time = $${paramIndex++}`);
      updateValues.push(start_time);
    }
    if (duration_minutes) {
      updateFields.push(`duration_minutes = $${paramIndex++}`);
      updateValues.push(duration_minutes);
    }
    if (service_type) {
      updateFields.push(`service_type = $${paramIndex++}`);
      updateValues.push(service_type);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateValues.push(notes);
    }
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE appointments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment: result.rows[0]
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;

    // Check if appointment exists
    const existingAppointment = await query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (existingAppointment.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Soft delete by updating status to cancelled
    await query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', id]
    );

    return NextResponse.json({
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
