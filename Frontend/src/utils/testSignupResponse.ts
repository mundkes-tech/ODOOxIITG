// Test signup response structure
import { authAPI } from '../services/api';

export const testSignupResponse = async () => {
  console.log('🧪 Testing signup response structure...');
  
  try {
    // Test data
    const testUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      companyName: 'Test Company',
      country: 'US',
      currency: 'USD'
    };
    
    console.log('📤 Sending signup request...');
    const response = await authAPI.signup(testUserData);
    
    console.log('📥 Signup response:', response);
    console.log('🔍 Response structure:');
    console.log('- success:', response.success);
    console.log('- token:', response.token ? '✅ Present' : '❌ Missing');
    console.log('- user:', response.user ? '✅ Present' : '❌ Missing');
    
    if (response.user) {
      console.log('👤 User data:');
      console.log('- id:', response.user.id);
      console.log('- name:', response.user.name);
      console.log('- email:', response.user.email);
      console.log('- role:', response.user.role);
      console.log('- companyId:', response.user.companyId);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Signup test failed:', error);
    throw error;
  }
};
