/**
 * seed.js – Run once to populate the DB with test users
 * Usage: node seed.js
 */
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/department_knowledge_hub';

const users = [
  // ── Students ──────────────────────────────────────
  {
    user_id:    'STU001',
    name:       'Alice Johnson',
    password:   'student123',
    role:       'student',
    department: 'Computer Science'
  },
  {
    user_id:    'STU002',
    name:       'Bob Williams',
    password:   'student123',
    role:       'student',
    department: 'Computer Science'
  },
  {
    user_id:    'STU003',
    name:       'Carol Davis',
    password:   'student123',
    role:       'student',
    department: 'Computer Science'
  },
  {
    user_id:    'STU004',
    name:       'David Brown',
    password:   'student123',
    role:       'student',
    department: 'Computer Science'
  },
  {
    user_id:    'STU005',
    name:       'Eva Martinez',
    password:   'student123',
    role:       'student',
    department: 'Computer Science'
  },

  // ── Admins / Faculty ──────────────────────────────
  {
    user_id:    'ADM001',
    name:       'Dr. Robert Smith',
    password:   'admin123',
    role:       'admin',
    department: 'Computer Science'
  },
  {
    user_id:    'ADM002',
    name:       'Prof. Sarah Lee',
    password:   'admin123',
    role:       'admin',
    department: 'Computer Science'
  },
  {
    user_id:    'ADM003',
    name:       'Dr. James Patel',
    password:   'admin123',
    role:       'admin',
    department: 'Computer Science'
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('🗑  Cleared existing users\n');

    for (const u of users) {
      const user = new User(u);
      await user.save();
      console.log(`   Created [${u.role.toUpperCase()}] ${u.user_id} — ${u.name}`);
    }

    console.log('\n════════════════════════════════');
    console.log('          SEED COMPLETE          ');
    console.log('════════════════════════════════');
    console.log('\n📘 STUDENT LOGINS (portal: localhost:4200)');
    console.log('   User ID   Name                Password');
    console.log('   STU001    Alice Johnson        student123');
    console.log('   STU002    Bob Williams         student123');
    console.log('   STU003    Carol Davis          student123');
    console.log('   STU004    David Brown          student123');
    console.log('   STU005    Eva Martinez         student123');
    console.log('\n⚙️  ADMIN LOGINS (portal: localhost:5173)');
    console.log('   User ID   Name                Password');
    console.log('   ADM001    Dr. Robert Smith     admin123');
    console.log('   ADM002    Prof. Sarah Lee      admin123');
    console.log('   ADM003    Dr. James Patel      admin123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
