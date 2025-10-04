# 🚀 Deployment Configuration Guide

## Frontend Deployment (Vercel)

### 1. Environment Variables Setup

Create a `.env` file in your Frontend folder with:

```env
VITE_API_URL=https://odooxiitg-1.onrender.com/api
VITE_APP_NAME=Expense Management System
VITE_APP_VERSION=1.0.0
```

### 2. Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

```
VITE_API_URL = https://odooxiitg-1.onrender.com/api
VITE_APP_NAME = Expense Management System
VITE_APP_VERSION = 1.0.0
```

### 3. Update API Configuration

The `api.ts` file has been updated to use:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://odooxiitg-1.onrender.com/api';
```

## Backend Deployment (Render)

### 1. Environment Variables on Render

Make sure your Render backend has these environment variables:

```
MONGODB_URI = your_mongodb_connection_string
JWT_SECRET = your_jwt_secret_key
JWT_REFRESH_SECRET = your_refresh_secret_key
NODE_ENV = production
PORT = 10000
```

### 2. CORS Configuration

Your backend should allow requests from:
```
https://odo-ox-iitg.vercel.app
```

## Testing Your Deployment

### 1. Test Backend Health
Visit: https://odooxiitg-1.onrender.com/api/health

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test Frontend Connection
Visit: https://odo-ox-iitg.vercel.app

Try to signup - should connect to your Render backend.

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Update backend CORS to allow Vercel domain:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://odo-ox-iitg.vercel.app'
  ],
  credentials: true
}));
```

### Issue 2: Environment Variables Not Loading
**Solution**: 
1. Check Vercel environment variables
2. Redeploy after adding env vars
3. Use hardcoded URL as fallback

### Issue 3: Backend Not Responding
**Solution**:
1. Check Render logs
2. Verify MongoDB connection
3. Check if backend is running

## Quick Fix Commands

### For Frontend (Vercel):
1. Add environment variables in Vercel dashboard
2. Redeploy your frontend
3. Test the connection

### For Backend (Render):
1. Check Render logs for errors
2. Verify environment variables
3. Restart the service if needed

## Testing Scripts

### Test Backend Health:
```bash
curl https://odooxiitg-1.onrender.com/api/health
```

### Test API Connection:
```bash
curl -X POST https://odooxiitg-1.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","companyName":"Test Company","country":"us","currency":"USD"}'
```

## Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render  
- [ ] Environment variables set
- [ ] CORS configured
- [ ] MongoDB connected
- [ ] API endpoints working
- [ ] Frontend-backend communication working
