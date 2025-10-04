// Debug user creation API call
import { userAPI } from '../services/api';

export const debugUserCreation = async () => {
  console.log('🔍 Debugging User Creation...');
  
  try {
    // Test data
    const testUserData = {
      name: 'Debug Test User',
      email: `debug-${Date.now()}@example.com`,
      password: 'password123',
      role: 'employee'
    };
    
    console.log('📤 Sending user creation request:', testUserData);
    
    // Check API configuration
    console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL || 'https://odooxiitg-1.onrender.com/api');
    
    const response = await userAPI.createUser(testUserData);
    
    console.log('✅ User creation successful!');
    console.log('📥 Response:', response);
    
    return response;
  } catch (error: any) {
    console.error('❌ User creation failed:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Check if it's a network error
    if (error.message.includes('<!DOCTYPE')) {
      console.error('🚨 HTML Response Error - Server returned HTML instead of JSON');
      console.error('💡 This usually means:');
      console.error('   - Backend server is not running');
      console.error('   - Wrong API endpoint URL');
      console.error('   - Server is returning 404 HTML page');
    }
    
    throw error;
  }
};

// Export for use in browser console
(window as any).debugUserCreation = debugUserCreation;
