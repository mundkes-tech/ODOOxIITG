# Expense Management Backend API

A comprehensive backend API for expense management system built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Create, read, update, and delete users with different roles
- **Company Management**: Multi-tenant company support
- **Expense Management**: Submit, approve, reject, and track expenses
- **Workflow Management**: Configurable approval workflows
- **OCR Integration**: Receipt image processing and data extraction
- **Analytics**: Dashboard analytics and reporting
- **Notifications**: Real-time notifications for expense updates
- **Settings**: Configurable approval rules and system settings

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Sign up new user (first user becomes admin)
- `POST /api/auth/login` - Login user with role validation
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user details

### User Routes
- `GET /api/users/` - Get all users in company (Admin)
- `GET /api/users/:id` - Get user details by ID (Admin/Self)
- `POST /api/users/create` - Create new user (Admin)
- `PUT /api/users/:id` - Update user details (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Company Routes
- `GET /api/company/` - Get company details (Authenticated)
- `PUT /api/company/:id` - Update company info (Admin)
- `DELETE /api/company/:id` - Delete company (Admin)

### Expense Routes
- `POST /api/expenses/` - Submit new expense (Employee)
- `GET /api/expenses/` - Get all user's expenses (Employee)
- `GET /api/expenses/:id` - Get expense details (Employee/Manager/Admin)
- `PUT /api/expenses/:id` - Edit expense (Employee)
- `DELETE /api/expenses/:id` - Delete expense (Employee)
- `PUT /api/expenses/:id/approve` - Approve expense (Manager/Admin)
- `PUT /api/expenses/:id/reject` - Reject expense (Manager/Admin)
- `PUT /api/expenses/:id/escalate` - Escalate expense (Manager/Admin)
- `GET /api/expenses/history` - Get expense history (Manager/Admin)

### Workflow Routes
- `POST /api/workflow/` - Create approval workflow (Admin)
- `GET /api/workflow/:expenseId` - Get workflow status (Employee/Manager/Admin)
- `PUT /api/workflow/:expenseId/approve` - Approve workflow step (Approver)
- `PUT /api/workflow/:expenseId/reject` - Reject workflow step (Approver)
- `PUT /api/workflow/:expenseId/escalate` - Escalate approval (Manager/Admin)

### OCR Routes
- `POST /api/ocr/upload` - Upload receipt image for OCR processing (Employee)
- `GET /api/ocr/:id` - Get parsed OCR data (Employee)

### Settings Routes
- `GET /api/settings/approval-rules` - Get approval rules (Admin)
- `POST /api/settings/approval-rules` - Add approval rule (Admin)
- `PUT /api/settings/approval-rules/:id` - Update approval rule (Admin)
- `DELETE /api/settings/approval-rules/:id` - Delete approval rule (Admin)

### Analytics Routes
- `GET /api/analytics/dashboard` - Get dashboard analytics (Manager/Admin)

### Notification Routes
- `GET /api/notifications/` - Get all notifications for user (Authenticated)
- `PUT /api/notifications/mark-read/:id` - Mark notification as read (Authenticated)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/expense-management
   
   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
   JWT_REFRESH_EXPIRE=7d
   
   # Server
   NODE_ENV=development
   PORT=5000
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@expensemanager.com
   ```

4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Project Structure

```
Backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── companyController.js  # Company management
│   ├── expenseController.js  # Expense management
│   ├── workflowController.js # Workflow management
│   ├── ocrController.js      # OCR processing
│   ├── settingsController.js # Settings management
│   ├── analyticsController.js # Analytics
│   └── notificationController.js # Notifications
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── error.js             # Error handling
│   ├── validation.js        # Request validation
│   ├── rateLimiter.js       # Rate limiting
│   └── companyAccess.js     # Company access control
├── models/
│   ├── User.js              # User model
│   ├── Company.js           # Company model
│   ├── Expense.js           # Expense model
│   ├── Workflow.js          # Workflow model
│   ├── OCR.js               # OCR model
│   ├── ApprovalRule.js      # Approval rule model
│   └── Notification.js      # Notification model
├── routes/
│   ├── authRoute.js         # Authentication routes
│   ├── userRoute.js         # User routes
│   ├── companyRoute.js      # Company routes
│   ├── expenseRoute.js      # Expense routes
│   ├── workflowRoute.js     # Workflow routes
│   ├── ocrRoute.js          # OCR routes
│   ├── settingsRoute.js     # Settings routes
│   ├── analyticsRoute.js    # Analytics routes
│   └── notificationRoute.js # Notification routes
├── utils/
│   ├── errorResponse.js     # Error response utility
│   ├── currencyConverter.js # Currency conversion
│   ├── jwt.js              # JWT utilities
│   ├── email.js            # Email utilities
│   └── logger.js           # Logging utilities
├── server.js               # Main server file
└── package.json            # Dependencies
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access Control

- **Admin**: Full access to all features
- **Manager**: Can manage employees and approve expenses
- **Employee**: Can submit and manage their own expenses

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

- Authentication routes: 5 requests per 15 minutes
- General API routes: 100 requests per 15 minutes
- OCR uploads: 10 requests per minute

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- Password hashing with bcrypt
- JWT token expiration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
