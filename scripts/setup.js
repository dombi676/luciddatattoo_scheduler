const { query } = require('../lib/database');
const { hashPassword } = require('../lib/auth');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin user already exists
    const existingAdmin = await query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
    } else {
      // Create admin user
      const hashedPassword = await hashPassword(adminPassword);
      
      await query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
        [adminEmail, hashedPassword, 'admin']
      );
      
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }

    // Set up default working hours (9 AM to 5 PM, Monday to Friday)
    const workingHoursCheck = await query('SELECT COUNT(*) FROM working_hours');
    
    if (parseInt(workingHoursCheck.rows[0].count) === 0) {
      const defaultHours = [
        { day: 0, working: false, start: '09:00', end: '17:00' }, // Sunday
        { day: 1, working: true, start: '09:00', end: '17:00' },  // Monday
        { day: 2, working: true, start: '09:00', end: '17:00' },  // Tuesday
        { day: 3, working: true, start: '09:00', end: '17:00' },  // Wednesday
        { day: 4, working: true, start: '09:00', end: '17:00' },  // Thursday
        { day: 5, working: true, start: '09:00', end: '17:00' },  // Friday
        { day: 6, working: false, start: '09:00', end: '17:00' }, // Saturday
      ];

      for (const hours of defaultHours) {
        await query(
          'INSERT INTO working_hours (day_of_week, is_working, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [hours.day, hours.working, hours.start, hours.end]
        );
      }
      
      console.log('✅ Default working hours set up');
    } else {
      console.log('✅ Working hours already configured');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit http://localhost:3000/admin');
    console.log(`3. Login with email: ${adminEmail}`);
    console.log(`4. Update your working hours and create booking links`);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = setupDatabase;
