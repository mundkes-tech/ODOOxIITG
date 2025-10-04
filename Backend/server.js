const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const realtimeService = require('./services/realtimeService');

// Load env vars
dotenv.config({ path: './.env' });

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Please create a .env file with the following content:');
  console.log('MONGODB_URI=mongodb://localhost:27017/expense-management');
  console.log('JWT_SECRET=your_super_secret_jwt_key_here');
  console.log('JWT_REFRESH_SECRET=your_super_secret_refresh_key_here');
  console.log('NODE_ENV=development');
  console.log('PORT=5000');
  process.exit(1);
}

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const companyRoutes = require('./routes/companyRoute');
const expenseRoutes = require('./routes/expenseRoute');
const workflowRoutes = require('./routes/workflowRoute');
const ocrRoutes = require('./routes/ocrRoute');
const settingsRoutes = require('./routes/settingsRoute');
const analyticsRoutes = require('./routes/analyticsRoute');
const notificationRoutes = require('./routes/notificationRoute');
const integrationRoutes = require('./routes/integrationRoute');
const smartFinanceRoutes = require('./routes/smartFinanceRoute');

const app = express();

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080', 
    'https://odo-ox-iitg.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/smart-finance', smartFinanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware (should be after all other middleware and routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize real-time service
realtimeService.initialize(server);

server.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});