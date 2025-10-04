// Test deployed backend on Render
const API_BASE_URL = 'https://odooxiitg-1.onrender.com/api';

async function testDeployedBackend() {
  try {
    console.log('🧪 Testing Deployed Backend on Render...\n');
    console.log('🔗 Backend URL:', API_BASE_URL);

    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthText = await healthResponse.text();
    
    console.log('✅ Status:', healthResponse.status);
    console.log('✅ Content-Type:', healthResponse.headers.get('content-type'));
    
    if (healthResponse.headers.get('content-type')?.includes('application/json')) {
      const healthData = JSON.parse(healthText);
      console.log('✅ Health check response:', healthData);
    } else {
      console.log('❌ Expected JSON but got:', healthText.substring(0, 200) + '...');
    }

    // Test 2: CORS Headers
    console.log('\n2. Testing CORS headers...');
    console.log('✅ Access-Control-Allow-Origin:', healthResponse.headers.get('access-control-allow-origin'));
    console.log('✅ Access-Control-Allow-Credentials:', healthResponse.headers.get('access-control-allow-credentials'));

    // Test 3: Signup Endpoint
    console.log('\n3. Testing signup endpoint...');
    const signupData = {
      name: 'Test Admin',
      email: 'admin@testcompany.com',
      password: 'password123',
      companyName: 'Test Company',
      country: 'us',
      currency: 'USD'
    };

    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://odo-ox-iitg.vercel.app'
      },
      body: JSON.stringify(signupData)
    });

    const signupText = await signupResponse.text();
    console.log('✅ Signup Status:', signupResponse.status);
    console.log('✅ Signup Content-Type:', signupResponse.headers.get('content-type'));

    if (signupResponse.headers.get('content-type')?.includes('application/json')) {
      const signupData = JSON.parse(signupText);
      console.log('✅ Signup response:', signupData);
    } else {
      console.log('❌ Signup returned HTML:', signupText.substring(0, 200) + '...');
    }

    console.log('\n🎉 Backend deployment test complete!');

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('   1. Backend not deployed properly');
    console.log('   2. MongoDB connection issues');
    console.log('   3. Environment variables missing');
    console.log('   4. Render service not running');
  }
}

testDeployedBackend();
