// Script to clear rate limit cache and restart server
const { exec } = require('child_process');

console.log('🔄 Clearing rate limit cache and restarting server...\n');

// Kill any existing node processes
exec('taskkill /f /im node.exe', (error) => {
  if (error) {
    console.log('ℹ️  No existing node processes to kill');
  } else {
    console.log('✅ Killed existing node processes');
  }
  
  // Wait a moment then start the server
  setTimeout(() => {
    console.log('🚀 Starting server with cleared rate limits...');
    exec('npm run dev', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error starting server:', error);
        return;
      }
      console.log('✅ Server started successfully!');
      console.log(stdout);
    });
  }, 2000);
});
