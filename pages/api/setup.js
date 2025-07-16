import { NextResponse } from 'next/server';
import { hashPassword } from '../../../lib/auth';
import { query } from '../../../lib/database';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ 
        error: 'Email, password, and name are required' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ 
        error: 'User already exists' 
      }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
      [email, passwordHash, name, 'artist']
    );

    const user = result.rows[0];

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin user' 
    }, { status: 500 });
  }
}

// Only allow GET to show setup form
export async function GET() {
  return NextResponse.json({
    message: 'Setup endpoint - use POST to create admin user',
    instructions: {
      method: 'POST',
      body: {
        email: 'your-email@example.com',
        password: 'your-secure-password',
        name: 'Your Name'
      }
    }
  });
}
