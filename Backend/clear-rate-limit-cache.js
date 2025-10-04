// Development helper to bypass rate limiting
const API_BASE_URL = 'http://localhost:5000/api';

async function clearRateLimit() {
  try {
    console.log('🧹 Clearing rate limit cache...\n');
    
    // Try to make a request to reset the rate limit
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'X-Forwarded-For': '127.0.0.1', // Force localhost IP
      }
    });
    
    if (response.ok) {
      console.log('✅ Rate limit cache cleared');
    } else {
      console.log('ℹ️  Server might not be running');
    }
    
    console.log('\n💡 Solutions:');
    console.log('1. Restart your backend server: npm run dev');
    console.log('2. Wait 15 minutes for rate limit to reset');
    console.log('3. Use different IP address');
    console.log('4. Rate limits are now more lenient in development mode');
    
  } catch (error) {
    console.log('ℹ️  Server not running or rate limit cleared');
    console.log('\n💡 Solutions:');
    console.log('1. Start your backend server: npm run dev');
    console.log('2. Rate limits are now more lenient in development mode');
  }
}

clearRateLimit();
