// Database reset script for development
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Company = require('./models/Company');
const Expense = require('./models/Expense');
const Workflow = require('./models/Workflow');
const OCR = require('./models/OCR');
const ApprovalRule = require('./models/ApprovalRule');
const Notification = require('./models/Notification');

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing all collections...');
    
    // Clear all collections
    await User.deleteMany({});
    await Company.deleteMany({});
    await Expense.deleteMany({});
    await Workflow.deleteMany({});
    await OCR.deleteMany({});
    await ApprovalRule.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
    console.log('\n🎉 You can now signup as the first user (admin)');
    console.log('💡 Run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

resetDatabase();
