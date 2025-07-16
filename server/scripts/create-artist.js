const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function createArtistAccount() {
  try {
    console.log('🔄 Creating artist account...');
    
    // Hash password
    const password = 'LuciddaTattoo2025!'; // Change this in production
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Update or insert user
    const result = await db.query(`
      INSERT INTO users (email, password_hash, name, role, timezone) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, name
    `, [
      'lucia@lucidda.tattoo',
      passwordHash,
      'Lucia',
      'artist',
      'America/Argentina/Jujuy'
    ]);
    
    console.log('✅ Artist account created/updated:', result.rows[0]);
    console.log('📧 Email: lucia@lucidda.tattoo');
    console.log('🔑 Password: LuciddaTattoo2025!');
    console.log('⚠️ Remember to change the password in production!');
    
  } catch (error) {
    console.error('❌ Failed to create artist account:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createArtistAccount().then(() => process.exit(0));
}

module.exports = { createArtistAccount };
