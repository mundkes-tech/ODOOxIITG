// Simple API configuration without environment variables
export const getApiUrl = () => {
  // Check current domain to determine API URL
  const hostname = window.location.hostname;
  
  // Development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Production - your deployed backend
  return 'https://odooxiitg-1.onrender.com/api';
};

export const API_BASE_URL = getApiUrl();
