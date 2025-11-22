const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database', 'stockmaster.db');
const db = new Database(dbPath);

const emails = [
  'ojassneve@gmail.com',
  'ojassachinneve@gmail.com',
  'tempmailll76@gmail.com',
  'ojasneve37@gmail.com',
  'ojasneve@gmail.com'
];

let totalUsersDeleted = 0;
let totalOTPsDeleted = 0;

// Temporarily disable foreign key constraints
db.pragma('foreign_keys = OFF');

emails.forEach(email => {
  // Get user ID first
  const getUser = db.prepare('SELECT id FROM users WHERE email = ?');
  const user = getUser.get(email);

  if (user) {
    // Delete related records first
    db.prepare('DELETE FROM operations WHERE created_by = ?').run(user.id);
    
    // Delete from users table
    const deleteUser = db.prepare('DELETE FROM users WHERE email = ?');
    const result = deleteUser.run(email);
    totalUsersDeleted += result.changes;

    console.log(`✅ ${email}: Deleted user and related data`);
  }

  // Delete any pending OTP verifications
  const deleteOTP = db.prepare('DELETE FROM otp_verifications WHERE email = ?');
  const otpResult = deleteOTP.run(email);
  totalOTPsDeleted += otpResult.changes;

  if (otpResult.changes > 0) {
    console.log(`✅ ${email}: Deleted ${otpResult.changes} OTP(s)`);
  }
});

// Re-enable foreign key constraints
db.pragma('foreign_keys = ON');

console.log('\n' + '='.repeat(60));
console.log(`✅ Total: ${totalUsersDeleted} user(s) and ${totalOTPsDeleted} OTP(s) deleted`);
console.log('='.repeat(60));

db.close();
console.log('✅ Database closed. You can now sign up again!');
