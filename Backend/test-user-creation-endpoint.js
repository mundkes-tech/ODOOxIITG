// Test user creation endpoint
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testUserCreation() {
  console.log('🧪 Testing User Creation Endpoint...');
  console.log('🌐 API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Check if server is running
    console.log('\n1️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      console.log('✅ Server is running:', healthResponse.status);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      console.log('💡 Make sure your backend server is running on port 5000');
      return;
    }

    // Test 2: Test authentication endpoint
    console.log('\n2️⃣ Testing authentication...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'password123'
      });
      console.log('✅ Authentication successful');
      const token = authResponse.data.token;
      
      // Test 3: Test user creation endpoint
      console.log('\n3️⃣ Testing user creation endpoint...');
      try {
        const userData = {
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'password123',
          role: 'employee'
        };
        
        console.log('📤 Sending user creation request:', userData);
        
        const createResponse = await axios.post(`${API_BASE_URL}/users`, userData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ User creation successful!');
        console.log('📥 Response:', createResponse.data);
        
      } catch (createError) {
        console.log('❌ User creation failed:', createError.response?.status);
        console.log('📥 Error response:', createError.response?.data);
        console.log('🔍 Error details:', {
          message: createError.message,
          status: createError.response?.status,
          statusText: createError.response?.statusText,
          data: createError.response?.data
        });
      }
      
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.response?.status);
      console.log('📥 Auth error response:', authError.response?.data);
      console.log('💡 Make sure you have an admin user in your database');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

// Run the test
testUserCreation();
