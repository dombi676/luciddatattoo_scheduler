# Supabase Setup Guide

## 🗄️ Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login (use GitHub for convenience)
3. Create new project:
   - Name: `lucid-tattoo-scheduler`
   - Region: **South America (São Paulo)**
   - Generate strong database password

## 🔧 Step 2: Get Connection Details

In your Supabase dashboard:

1. Go to **Settings** → **Database**
2. Find **Connection String** section
3. Copy the **PostgreSQL** connection string
4. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## 🏗️ Step 3: Create Database Schema

In Supabase dashboard:

1. Go to **SQL Editor**
2. Create a **New Query**
3. **Copy the complete schema from your `database/schema.sql` file** (it's already in your repo!)

Or run this exact schema that matches your app:

```sql
-- Lucidda Tattoo Scheduler Database Schema

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS booking_links CASCADE;
DROP TABLE IF EXISTS availability_overrides CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for Lucia's authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'artist',
    timezone VARCHAR(100) DEFAULT 'America/Argentina/Jujuy',
    push_token VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Working hours table (Lucia's regular schedule)
CREATE TABLE working_hours (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Availability overrides (vacations, doctor appointments, etc.)
CREATE TABLE availability_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Booking links (one-time use links sent to clients)
CREATE TABLE booking_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(100) UNIQUE NOT NULL,
    tattoo_description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_link_id INTEGER REFERENCES booking_links(id) ON DELETE SET NULL,
    
    -- Client information
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_dni VARCHAR(50) NOT NULL,
    
    -- Appointment details
    tattoo_description TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'confirmed',
    
    -- Notifications
    email_sent_at TIMESTAMP WITH TIME ZONE,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_working_hours_user_day ON working_hours(user_id, day_of_week);
CREATE INDEX idx_availability_overrides_user_date ON availability_overrides(user_id, date);
CREATE INDEX idx_booking_links_token ON booking_links(token);
CREATE INDEX idx_booking_links_expires ON booking_links(expires_at);
CREATE INDEX idx_appointments_user_date ON appointments(user_id, appointment_date);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, start_time);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON working_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔑 Step 4: Create Admin User & Set up Security

After creating the schema, run these commands:

1. **Enable Row Level Security** (run the `database/supabase_migration.sql` from your repo):

```sql
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_links ENABLE ROW LEVEL SECURITY;

-- Create policies for API access (service role bypass)
CREATE POLICY "Service role access" ON users FOR ALL USING (true);
CREATE POLICY "Service role access" ON appointments FOR ALL USING (true);
CREATE POLICY "Service role access" ON working_hours FOR ALL USING (true);
CREATE POLICY "Service role access" ON availability_overrides FOR ALL USING (true);
CREATE POLICY "Service role access" ON booking_links FOR ALL USING (true);
```

2. **Create an admin user** (we'll use your app's API to create it properly):

```sql
-- We'll create the admin user through the app after setup
-- For now, just insert a temporary admin to test login
INSERT INTO users (email, password_hash, name, role) 
VALUES ('lucia@lucidda.tattoo', '$2b$10$placeholder', 'Lucia', 'artist');
```

**Note**: We'll create the real admin user with proper password hashing through your app's API once everything is connected.

## 🌐 Step 5: Configure Vercel Environment Variables

In your Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NEXTAUTH_SECRET=another-super-secret-key-32-chars-minimum
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

## 🔄 Step 6: Redeploy

After adding environment variables:
1. Go to **Deployments** in Vercel
2. Click the three dots on latest deployment
3. **Redeploy**

## ✅ Step 7: Test

1. Visit your deployed app
2. Try admin login (you'll need to create admin user first)
3. Test booking system

## 🚨 Security Notes

- **Change default passwords immediately**
- **Use strong, unique passwords**
- **Enable Row Level Security (RLS) in Supabase for production**
- **Consider enabling 2FA on Supabase account**

## 🔧 Troubleshooting

### Login Still Fails?
- Check if DATABASE_URL is correct
- Verify admin user exists in database
- Check browser console for errors
- Ensure JWT_SECRET is set

### Database Connection Issues?
- Verify connection string format
- Check if Supabase project is running
- Confirm region is accessible

### Need to Reset Admin Password?
```sql
-- In Supabase SQL Editor
UPDATE users 
SET password_hash = '$2b$10$[NEW-HASHED-PASSWORD]' 
WHERE username = 'admin';
```
