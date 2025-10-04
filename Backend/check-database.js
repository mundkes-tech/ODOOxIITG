// Development helper to check database status
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Company = require('./models/Company');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userCount = await User.countDocuments({});
    const companyCount = await Company.countDocuments({});
    
    console.log(`📊 Database Status:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Companies: ${companyCount}`);
    
    if (userCount === 0) {
      console.log('\n✅ Database is empty - you can signup as first user');
    } else {
      console.log('\n⚠️  Database has existing users');
      console.log('💡 Solutions:');
      console.log('   1. Use different email for signup');
      console.log('   2. Reset database: node reset-database.js');
      console.log('   3. Development mode allows signup anyway');
    }
    
    // Show existing users
    if (userCount > 0) {
      const users = await User.find({}).select('name email role');
      console.log('\n👥 Existing Users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabaseStatus();
