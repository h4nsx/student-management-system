require('dotenv').config();
const db = require('./src/config/db');
const { hashPassword } = require('./src/utils/hashPassword');

async function createDemoUser() {
  try {
    const hashed = await hashPassword('password123');
    const res = await db.query(
      'INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id',
      ['demo@example.com', hashed, 'student', 'active']
    );
    if (res.rows.length > 0) {
      const userId = res.rows[0].id;
      await db.query(
        'INSERT INTO students (user_id, student_code, full_name, faculty_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [userId, 'demo@example.com', 'Demo Student', null]
      );
      console.log('Demo user created successfully: demo@example.com / password123');
    } else {
      console.log('Demo user already exists. Email: demo@example.com, Password: password123');
    }
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    process.exit(0);
  }
}

createDemoUser();
