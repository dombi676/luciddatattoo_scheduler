import { NextResponse } from 'next/server';
import { query } from '../../../lib/database';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { duration_minutes, expiry_date, max_uses, service_type, notes } = await request.json();

    if (!duration_minutes || !expiry_date) {
      return NextResponse.json({ error: 'Duration and expiry date are required' }, { status: 400 });
    }

    // Generate unique booking link ID
    const linkId = crypto.randomUUID();

    // Create booking link
    const result = await query(
      `INSERT INTO booking_links (id, duration_minutes, expiry_date, max_uses, service_type, notes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [linkId, duration_minutes, expiry_date, max_uses, service_type, notes]
    );

    const bookingLink = result.rows[0];

    return NextResponse.json({
      message: 'Booking link created successfully',
      bookingLink: {
        ...bookingLink,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${linkId}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create booking link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeExpired = searchParams.get('includeExpired') === 'true';

    let queryText = 'SELECT * FROM booking_links';
    let params = [];

    if (!includeExpired) {
      queryText += ' WHERE expiry_date > NOW() AND is_active = true';
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    const bookingLinks = result.rows.map(link => ({
      ...link,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${link.id}`
    }));

    return NextResponse.json({
      bookingLinks
    });

  } catch (error) {
    console.error('Get booking links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
