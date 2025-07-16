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

    const result = await query(
      'SELECT * FROM working_hours ORDER BY day_of_week'
    );

    return NextResponse.json({
      workingHours: result.rows
    });

  } catch (error) {
    console.error('Get working hours error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { workingHours } = await request.json();

    if (!Array.isArray(workingHours)) {
      return NextResponse.json({ error: 'Working hours must be an array' }, { status: 400 });
    }

    // Update working hours for each day
    for (const day of workingHours) {
      await query(
        `UPDATE working_hours 
         SET is_working = $1, start_time = $2, end_time = $3 
         WHERE day_of_week = $4`,
        [day.is_working, day.start_time, day.end_time, day.day_of_week]
      );
    }

    return NextResponse.json({
      message: 'Working hours updated successfully'
    });

  } catch (error) {
    console.error('Update working hours error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
