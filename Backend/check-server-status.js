// Simple server status checker
const http = require('http');

function checkServerStatus() {
  console.log('🔍 Checking if backend server is running...\n');

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log('✅ Server is running!');
    console.log('✅ Status:', res.statusCode);
    console.log('✅ Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Response:', data);
      console.log('\n🎉 Backend server is healthy!');
    });
  });

  req.on('error', (error) => {
    console.log('❌ Server is not running or not accessible');
    console.log('❌ Error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('   1. Start backend: cd Backend && npm run dev');
    console.log('   2. Check if port 5000 is available');
    console.log('   3. Check for any error messages in terminal');
  });

  req.on('timeout', () => {
    console.log('❌ Server request timed out');
    console.log('💡 Server might be running but not responding');
    req.destroy();
  });

  req.end();
}

checkServerStatus();
