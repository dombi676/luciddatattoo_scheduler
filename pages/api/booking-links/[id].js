import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get booking link details
    const linkResult = await query(
      'SELECT * FROM booking_links WHERE id = $1',
      [id]
    );

    if (linkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking link not found' }, { status: 404 });
    }

    const bookingLink = linkResult.rows[0];

    // Check if link is still valid
    if (!bookingLink.is_active) {
      return NextResponse.json({ error: 'Booking link is inactive' }, { status: 410 });
    }

    if (new Date(bookingLink.expiry_date) < new Date()) {
      return NextResponse.json({ error: 'Booking link has expired' }, { status: 410 });
    }

    // Check usage limit
    if (bookingLink.max_uses && bookingLink.uses_count >= bookingLink.max_uses) {
      return NextResponse.json({ error: 'Booking link has reached maximum uses' }, { status: 410 });
    }

    return NextResponse.json({
      bookingLink: {
        id: bookingLink.id,
        duration_minutes: bookingLink.duration_minutes,
        service_type: bookingLink.service_type,
        notes: bookingLink.notes
      }
    });

  } catch (error) {
    console.error('Get booking link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { client_name, client_email, client_phone, start_time } = await request.json();

    if (!client_name || !client_email || !start_time) {
      return NextResponse.json({ error: 'Name, email and start time are required' }, { status: 400 });
    }

    // Get booking link details
    const linkResult = await query(
      'SELECT * FROM booking_links WHERE id = $1',
      [id]
    );

    if (linkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking link not found' }, { status: 404 });
    }

    const bookingLink = linkResult.rows[0];

    // Validate link
    if (!bookingLink.is_active) {
      return NextResponse.json({ error: 'Booking link is inactive' }, { status: 410 });
    }

    if (new Date(bookingLink.expiry_date) < new Date()) {
      return NextResponse.json({ error: 'Booking link has expired' }, { status: 410 });
    }

    if (bookingLink.max_uses && bookingLink.uses_count >= bookingLink.max_uses) {
      return NextResponse.json({ error: 'Booking link has reached maximum uses' }, { status: 410 });
    }

    // Check for conflicts
    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE start_time < $1 + interval '${bookingLink.duration_minutes} minutes' 
       AND start_time + interval '1 minute' * duration_minutes > $1
       AND status != 'cancelled'`,
      [start_time]
    );

    if (conflictCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 });
    }

    // Create or find client
    let clientResult = await query(
      'SELECT id FROM clients WHERE email = $1',
      [client_email]
    );

    let clientId;
    if (clientResult.rows.length > 0) {
      clientId = clientResult.rows[0].id;
      
      // Update client info
      await query(
        'UPDATE clients SET name = $1, phone = $2 WHERE id = $3',
        [client_name, client_phone, clientId]
      );
    } else {
      // Create new client
      const newClient = await query(
        'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [client_name, client_email, client_phone]
      );
      clientId = newClient.rows[0].id;
    }

    // Create appointment
    const appointment = await query(
      `INSERT INTO appointments (client_id, start_time, duration_minutes, service_type, notes, status, booking_link_id)
       VALUES ($1, $2, $3, $4, $5, 'confirmed', $6) RETURNING *`,
      [clientId, start_time, bookingLink.duration_minutes, bookingLink.service_type, bookingLink.notes, id]
    );

    // Update booking link usage count
    await query(
      'UPDATE booking_links SET uses_count = uses_count + 1 WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment: appointment.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Book appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
