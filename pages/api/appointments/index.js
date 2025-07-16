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

    let queryText = `
      SELECT 
        a.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
    `;
    
    let params = [];
    
    if (date) {
      queryText += ' WHERE DATE(a.start_time) = $1';
      params.push(date);
    }
    
    queryText += ' ORDER BY a.start_time ASC';

    const result = await query(queryText, params);

    return NextResponse.json({
      appointments: result.rows
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { client_name, client_email, client_phone, start_time, duration_minutes, service_type, notes } = await request.json();

    // Validate required fields
    if (!client_name || !client_email || !start_time || !duration_minutes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for conflicts
    const conflictCheck = await query(
      `SELECT id FROM appointments 
       WHERE start_time < $1 + interval '${duration_minutes} minutes' 
       AND start_time + interval '1 minute' * duration_minutes > $1
       AND status != 'cancelled'`,
      [start_time]
    );

    if (conflictCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Time slot conflicts with existing appointment' }, { status: 409 });
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
      `INSERT INTO appointments (client_id, start_time, duration_minutes, service_type, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmed') RETURNING *`,
      [clientId, start_time, duration_minutes, service_type, notes]
    );

    return NextResponse.json({
      message: 'Appointment created successfully',
      appointment: appointment.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
