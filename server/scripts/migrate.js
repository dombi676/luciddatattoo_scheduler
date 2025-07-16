const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('🔄 Running database migration...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../database/schema.sql'), 
      'utf8'
    );
    
    await pool.query(schemaSQL);
    console.log('✅ Schema created successfully');
    
    // Read and execute seed data
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../database/seed.sql'), 
      'utf8'
    );
    
    await pool.query(seedSQL);
    console.log('✅ Seed data inserted successfully');
    
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };
