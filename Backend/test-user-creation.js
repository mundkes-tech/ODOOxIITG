// Test user creation endpoint
const API_BASE_URL = 'http://localhost:5000/api';

async function testUserCreation() {
  try {
    console.log('🧪 Testing User Creation Endpoint...\n');

    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@testcompany.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.log('❌ Login failed:', loginResult.error);
      console.log('💡 Make sure you have an admin user created');
      return;
    }

    const token = loginResult.token;
    console.log('✅ Admin login successful');

    // Test user creation
    console.log('\n2. Testing user creation...');
    const userData = {
      name: 'Test Employee',
      email: 'employee@testcompany.com',
      password: 'password123',
      role: 'employee'
    };

    const createResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    const createResult = await createResponse.text();
    console.log('✅ Status:', createResponse.status);
    console.log('✅ Response type:', createResponse.headers.get('content-type'));

    if (createResponse.headers.get('content-type')?.includes('application/json')) {
      const userResult = JSON.parse(createResult);
      console.log('✅ User created:', userResult);
    } else {
      console.log('❌ Expected JSON but got:', createResult.substring(0, 200) + '...');
    }

    // Test getting users
    console.log('\n3. Testing get users...');
    const getUsersResponse = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const getUsersResult = await getUsersResponse.text();
    console.log('✅ Status:', getUsersResponse.status);

    if (getUsersResponse.headers.get('content-type')?.includes('application/json')) {
      const usersResult = JSON.parse(getUsersResult);
      console.log('✅ Users retrieved:', usersResult);
    } else {
      console.log('❌ Expected JSON but got:', getUsersResult.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserCreation();
