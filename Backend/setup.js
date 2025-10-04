const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/expense-management

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_12345
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_long_and_secure_67890
JWT_REFRESH_EXPIRE=7d

# Server
NODE_ENV=development
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@expensemanager.com

# Logging
LOG_LEVEL=info`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the JWT secrets with your own secure values');
} else {
  console.log('✅ .env file already exists');
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ logs directory created');
}

console.log('🚀 Setup complete! You can now run: npm run dev');
