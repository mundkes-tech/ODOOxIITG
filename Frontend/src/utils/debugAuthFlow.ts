// Debug authentication flow
import { authAPI } from '../services/api';

export const debugAuthFlow = async () => {
  console.log('🔍 Debugging Authentication Flow...');
  
  try {
    // Test 1: Check API configuration
    console.log('\n1️⃣ Testing API Configuration...');
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api' 
      : 'https://odooxiitg-1.onrender.com/api';
    console.log('🌐 API URL:', apiUrl);
    
    // Test 2: Test backend health
    console.log('\n2️⃣ Testing Backend Health...');
    try {
      const healthResponse = await fetch(`${apiUrl.replace('/api', '')}/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Backend health:', healthData);
    } catch (error) {
      console.log('❌ Backend health check failed:', error);
    }
    
    // Test 3: Test signup endpoint
    console.log('\n3️⃣ Testing Signup Endpoint...');
    const testData = {
      name: 'Debug Test User',
      email: `debug-${Date.now()}@example.com`,
      password: 'password123',
      companyName: 'Debug Company',
      country: 'US',
      currency: 'USD'
    };
    
    console.log('📤 Sending signup request with data:', testData);
    
    const signupResponse = await authAPI.signup(testData);
    console.log('📥 Signup response:', signupResponse);
    
    // Test 4: Verify response structure
    console.log('\n4️⃣ Verifying Response Structure...');
    console.log('Response keys:', Object.keys(signupResponse));
    console.log('Has success:', 'success' in signupResponse);
    console.log('Has token:', 'token' in signupResponse);
    console.log('Has user:', 'user' in signupResponse);
    
    if (signupResponse.user) {
      console.log('User object keys:', Object.keys(signupResponse.user));
      console.log('User ID:', signupResponse.user.id);
      console.log('User name:', signupResponse.user.name);
      console.log('User role:', signupResponse.user.role);
    }
    
    return signupResponse;
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

// Export for use in browser console
(window as any).debugAuthFlow = debugAuthFlow;
