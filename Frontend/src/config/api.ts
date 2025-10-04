// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Production - use your Render backend
  return 'https://odooxiitg-1.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging
console.log('🔗 API Base URL:', API_BASE_URL);
