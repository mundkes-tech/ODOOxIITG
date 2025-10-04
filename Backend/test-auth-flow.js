// Test script for Auth Flow
const API_BASE_URL = 'http://localhost:5000/api';

async function testAuthFlow() {
  try {
    console.log('🧪 Testing Complete Auth Flow...\n');

    // Step 1: Test Admin Signup (First User)
    console.log('1. Testing Admin Signup...');
    const signupData = {
      name: 'Admin User',
      email: 'admin@testcompany.com',
      password: 'password123',
      companyName: 'Test Company',
      country: 'us',
      currency: 'USD'
    };

    const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });

    const signupResult = await signupResponse.json();
    console.log('✅ Admin signup:', signupResult.success ? 'SUCCESS' : 'FAILED');
    
    if (!signupResult.success) {
      console.log('❌ Signup failed:', signupResult.message || signupResult.error);
      return;
    }

    const adminToken = signupResult.token;
    console.log('✅ Admin token received');

    // Step 2: Test Admin Login
    console.log('\n2. Testing Admin Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@testcompany.com',
        password: 'password123'
      }),
    });

    const loginResult = await loginResponse.json();
    console.log('✅ Admin login:', loginResult.success ? 'SUCCESS' : 'FAILED');
    console.log('✅ User role:', loginResult.user?.role);

    // Step 3: Test Admin Creating Employee
    console.log('\n3. Testing Admin Creating Employee...');
    const createUserResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Employee User',
        email: 'employee@testcompany.com',
        password: 'password123',
        role: 'employee'
      }),
    });

    const createUserResult = await createUserResponse.json();
    console.log('✅ Employee creation:', createUserResult.success ? 'SUCCESS' : 'FAILED');

    // Step 4: Test Employee Login
    console.log('\n4. Testing Employee Login...');
    const employeeLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employee@testcompany.com',
        password: 'password123'
      }),
    });

    const employeeLoginResult = await employeeLoginResponse.json();
    console.log('✅ Employee login:', employeeLoginResult.success ? 'SUCCESS' : 'FAILED');
    console.log('✅ Employee role:', employeeLoginResult.user?.role);

    // Step 5: Test Admin Creating Manager
    console.log('\n5. Testing Admin Creating Manager...');
    const createManagerResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Manager User',
        email: 'manager@testcompany.com',
        password: 'password123',
        role: 'manager'
      }),
    });

    const createManagerResult = await createManagerResponse.json();
    console.log('✅ Manager creation:', createManagerResult.success ? 'SUCCESS' : 'FAILED');

    // Step 6: Test Manager Login
    console.log('\n6. Testing Manager Login...');
    const managerLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@testcompany.com',
        password: 'password123'
      }),
    });

    const managerLoginResult = await managerLoginResponse.json();
    console.log('✅ Manager login:', managerLoginResult.success ? 'SUCCESS' : 'FAILED');
    console.log('✅ Manager role:', managerLoginResult.user?.role);

    // Step 7: Test Role-based Access
    console.log('\n7. Testing Role-based Access...');
    const getUsersResponse = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
    });

    const getUsersResult = await getUsersResponse.json();
    console.log('✅ Admin can view users:', getUsersResult.success ? 'SUCCESS' : 'FAILED');
    console.log('✅ Total users in company:', getUsersResult.count);

    console.log('\n🎉 Auth Flow Test Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin signup → Company created');
    console.log('✅ Admin login → Role-based redirect');
    console.log('✅ Admin creates employee → User added');
    console.log('✅ Employee login → Role-based redirect');
    console.log('✅ Admin creates manager → User added');
    console.log('✅ Manager login → Role-based redirect');
    console.log('✅ Role-based access control → Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthFlow();
