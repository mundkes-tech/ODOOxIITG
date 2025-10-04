// API Health Check Script
const API_BASE_URL = 'http://localhost:5000/api';

async function checkAPIServer() {
  try {
    console.log('🔍 Checking API Server Status...\n');

    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthText = await healthResponse.text();
    
    console.log('✅ Status:', healthResponse.status);
    console.log('✅ Response type:', healthResponse.headers.get('content-type'));
    
    if (healthResponse.headers.get('content-type')?.includes('application/json')) {
      const healthData = JSON.parse(healthText);
      console.log('✅ Health check:', healthData);
    } else {
      console.log('❌ Expected JSON but got:', healthText.substring(0, 100) + '...');
    }

    // Test 2: Check if server is running
    console.log('\n2. Testing server root...');
    try {
      const rootResponse = await fetch('http://localhost:5000/');
      const rootText = await rootResponse.text();
      console.log('✅ Server root response:', rootText.substring(0, 100) + '...');
    } catch (error) {
      console.log('❌ Server root error:', error.message);
    }

    // Test 3: Test auth endpoint
    console.log('\n3. Testing auth endpoint...');
    try {
      const authResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@test.com',
          password: 'test123',
          companyName: 'Test Company',
          country: 'us',
          currency: 'USD'
        })
      });
      
      const authText = await authResponse.text();
      console.log('✅ Auth endpoint status:', authResponse.status);
      
      if (authResponse.headers.get('content-type')?.includes('application/json')) {
        const authData = JSON.parse(authText);
        console.log('✅ Auth response:', authData);
      } else {
        console.log('❌ Auth endpoint returned HTML:', authText.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ Auth endpoint error:', error.message);
    }

  } catch (error) {
    console.error('❌ API Server check failed:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('   1. Backend server not running');
    console.log('   2. Wrong port (should be 5000)');
    console.log('   3. CORS issues');
    console.log('   4. Server crashed');
  }
}

checkAPIServer();
