# Development Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (v12 or higher)
3. **iOS Development Environment** (Xcode for iOS app)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm run install:all
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb lucidda_scheduler

# Copy environment file
cp server/.env.example server/.env

# Edit server/.env with your database credentials
# Update: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

### 3. Run Database Migration

```bash
cd server
npm run db:migrate
```

### 4. Create Artist Account

```bash
cd server
node scripts/create-artist.js
```

This creates the default login:
- Email: `lucia@lucidda.tattoo`
- Password: `LuciddaTattoo2025!`

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This starts:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

## Testing the Booking Flow

1. **Login to create booking link**: 
   - Open iOS app or use API directly
   - Login with artist credentials
   - Create a test booking link

2. **Test client booking**:
   - Visit the booking link
   - Fill out client form
   - Select date and time
   - Confirm booking

## Environment Variables

### Server (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lucidda_scheduler
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MAIN_WEBSITE_URL=https://lucidda.tattoo
TIMEZONE=America/Argentina/Jujuy
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Artist login
- `PUT /api/auth/push-token` - Update push token
- `GET /api/auth/profile` - Get profile

### Availability Management
- `GET /api/availability/working-hours` - Get working hours
- `PUT /api/availability/working-hours` - Update working hours
- `GET /api/availability/overrides` - Get availability overrides
- `POST /api/availability/overrides` - Add override
- `DELETE /api/availability/overrides/:id` - Delete override

### Appointments
- `POST /api/appointments/create-link` - Create booking link
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Booking (Public)
- `GET /api/booking/:token` - Get booking details
- `GET /api/booking/:token/available-dates` - Get available dates
- `GET /api/booking/:token/available-times/:date` - Get available times
- `POST /api/booking/:token/book` - Book appointment

## Production Deployment

### Hosting Requirements

Your current Namecheap shared hosting won't work. You need:

1. **VPS or Cloud hosting** with:
   - Node.js support
   - PostgreSQL database
   - SSL certificate (HTTPS required)
   - Subdomain for API (e.g., api.lucidda.tattoo)

### Recommended Hosting Options

1. **Railway** (easiest)
   - Automatic deployments from GitHub
   - Built-in PostgreSQL
   - Automatic SSL
   - ~$5-10/month

2. **DigitalOcean App Platform**
   - Similar to Railway
   - More configuration options
   - ~$10-15/month

3. **Traditional VPS** (DigitalOcean Droplet, Linode, etc.)
   - More control but requires server management
   - ~$6-20/month

### Production Environment Setup

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Deploy backend API
5. Build and deploy frontend
6. Configure domain/subdomain
7. Set up SSL certificate

### Integration with Main Website

Add this to your main website (lucidda.tattoo) to handle booking routes:

```javascript
// In your main website, add route handling for /book/*
// Redirect or proxy to your booking application
```

## iOS App Development

The iOS app will need:

1. **SwiftUI interface** with three main screens:
   - Working hours management
   - Create booking links
   - View appointments

2. **API integration** using URLSession

3. **Push notifications** setup with APNS

4. **Authentication** with JWT tokens

## Next Steps

1. Set up the development environment
2. Test the booking flow
3. Develop the iOS app
4. Set up production hosting
5. Configure email and push notifications
6. Deploy and test in production
