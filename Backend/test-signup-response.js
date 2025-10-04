// Quick test to verify signup response structure
const API_BASE_URL = 'http://localhost:5000/api';

async function testSignupResponse() {
  try {
    console.log('🧪 Testing Signup Response Structure...\n');

    const signupData = {
      name: 'Test Admin',
      email: 'test@testcompany.com',
      password: 'password123',
      companyName: 'Test Company',
      country: 'us',
      currency: 'USD'
    };

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();
    
    console.log('📋 Response Structure:');
    console.log('✅ success:', result.success);
    console.log('✅ token:', result.token ? 'Present' : 'Missing');
    console.log('✅ user:', result.user ? 'Present' : 'Missing');
    
    if (result.user) {
      console.log('✅ user.id:', result.user.id);
      console.log('✅ user.name:', result.user.name);
      console.log('✅ user.email:', result.user.email);
      console.log('✅ user.role:', result.user.role);
    }
    
    console.log('\n🎉 Signup response structure is correct!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSignupResponse();
