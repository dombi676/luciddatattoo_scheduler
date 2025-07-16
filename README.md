# Lucid Tattoo Scheduler

A modern, full-stack scheduling system built specifically for tattoo artists using Next.js. Features appointment management, one-time booking links, and a comprehensive admin interface.

## Features

- **Next.js Full-Stack**: Unified frontend and backend with API routes
- **Admin Dashboard**: Comprehensive web interface for managing appointments
- **Custom Booking Links**: Generate unique one-time or limited-use booking links
- **Flexible Scheduling**: Support for custom appointment durations
- **Client Management**: Store client information and appointment history
- **Working Hours Management**: Set availability and handle day-specific overrides
- **Real-time Availability**: Dynamic time slot calculation
- **Mobile Responsive**: Works seamlessly on all devices
- **Easy Deployment**: Single app deployment with Vercel, Railway, or any Node.js host

## Technology Stack

- **Framework**: Next.js 14 (App Router + Pages Router hybrid)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens with HTTP-only cookies
- **Deployment**: Vercel (recommended), Railway, or DigitalOcean

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd luciddatattoo_scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb lucid_tattoo_scheduler
   
   # Run database schema
   psql lucid_tattoo_scheduler < database/schema.sql
   ```

4. **Configure environment variables**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Edit .env.local with your database credentials and settings
   ```

5. **Set up initial data**
   ```bash
   # Create admin user and default working hours
   npm run setup
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## Project Structure

```
luciddatattoo_scheduler/
├── pages/                 # Next.js pages and API routes
│   ├── api/              # Backend API endpoints
│   ├── admin/            # Admin interface pages
│   ├── book/             # Client booking pages
│   └── index.js          # Home page
├── lib/                  # Shared utilities
│   ├── database.js       # Database connection
│   └── auth.js           # Authentication helpers
├── components/           # Reusable React components
├── styles/              # Global styles and Tailwind CSS
├── database/            # Database schema and scripts
├── scripts/             # Setup and utility scripts
└── middleware.js        # Next.js middleware for auth
```

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lucid_tattoo_scheduler
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Admin User (for initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Usage

### Admin Interface

1. **Login**: Navigate to `/admin` and log in with your admin credentials
2. **Dashboard**: View appointment statistics and quick actions at `/admin/dashboard`
3. **Appointments**: Manage existing appointments and create new ones
4. **Working Hours**: Set your availability for each day
5. **Booking Links**: Create one-time or limited-use booking links for clients

### Client Booking

1. **Booking Link**: Clients receive a unique booking link (`/book/{link-id}`)
2. **Information**: Provide contact details
3. **Time Selection**: Choose from available time slots
4. **Confirmation**: Receive appointment confirmation

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

#### Appointments
- `GET /api/appointments` - List appointments (admin)
- `POST /api/appointments` - Create appointment (admin)
- `PUT /api/appointments/[id]` - Update appointment (admin)
- `DELETE /api/appointments/[id]` - Cancel appointment (admin)

#### Availability
- `GET /api/availability` - Get available time slots
- `GET /api/working-hours` - Get working hours (admin)
- `PUT /api/working-hours` - Update working hours (admin)

#### Booking Links
- `GET /api/booking-links` - List booking links (admin)
- `POST /api/booking-links` - Create booking link (admin)
- `GET /api/booking-links/[id]` - Get booking link details
- `POST /api/booking-links/[id]` - Book appointment using link

## Database Schema

The system uses PostgreSQL with the following main tables:

- `users` - Admin users
- `clients` - Client information
- `appointments` - Appointment records
- `working_hours` - Weekly availability
- `day_overrides` - Day-specific availability changes
- `booking_links` - One-time booking links

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Set up PostgreSQL database (Vercel Postgres, Railway, or external)
5. Deploy automatically

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Set up PostgreSQL database service
4. Deploy automatically on push

### DigitalOcean App Platform

1. Create a new app from GitHub
2. Configure environment variables
3. Set up PostgreSQL database addon
4. Deploy

### Manual Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Build and start the application:
   ```bash
   npm run build
   npm start
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run setup` - Initialize database with admin user and default settings
- `npm run lint` - Run ESLint

### Key Features of Next.js Migration

1. **Unified Codebase**: Single repository with integrated frontend/backend
2. **API Routes**: Backend logic in `/pages/api` directory
3. **Better SEO**: Server-side rendering for public pages
4. **Simplified Deployment**: Single app deployment to platforms like Vercel
5. **Better Developer Experience**: Hot reloading for both frontend and backend
6. **Optimized Performance**: Automatic code splitting and optimization

### Migrating from Separate Frontend/Backend

This project has been migrated from separate Node.js/Express backend and React frontend to a unified Next.js application. Key changes:

- Express routes → Next.js API routes
- Separate client/server → Unified pages structure
- Multiple deployment targets → Single deployment
- Complex CORS handling → Built-in API integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues or questions:

1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue with detailed information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

4. Run development servers:
   ```bash
   npm run dev
   ```

## Hosting Requirements

⚠️ **Important**: This system requires more than shared hosting. Recommended:
- VPS or cloud hosting (DigitalOcean, AWS, Railway)
- SSL certificate for HTTPS
- Subdomain for API (api.lucidda.tattoo)

## Workflow

1. **Lucia creates appointment**: Sets duration and description in iOS app
2. **Generate booking link**: One-time use link sent to client via WhatsApp
3. **Client books**: Visits link, fills info, selects time slot
4. **Confirmation**: Email sent to client, push notification to Lucia
5. **Calendar updated**: Time slot marked as unavailable

## Next Steps

- [ ] Set up PostgreSQL database
- [ ] Implement backend API
- [ ] Build React booking interface
- [ ] Develop iOS app
- [ ] Set up hosting and deployment
