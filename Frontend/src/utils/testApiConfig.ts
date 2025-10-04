// Test API configuration
import { API_BASE_URL } from './apiConfig';

export const testApiConfig = () => {
  console.log('🔗 Current API URL:', API_BASE_URL);
  console.log('🌐 Current hostname:', window.location.hostname);
  console.log('📍 Current URL:', window.location.href);
  
  // Test if the API URL is correct
  if (API_BASE_URL.includes('odooxiitg-1.onrender.com')) {
    console.log('✅ Using production API (Render)');
  } else if (API_BASE_URL.includes('localhost')) {
    console.log('✅ Using development API (localhost)');
  } else {
    console.log('⚠️ Unknown API configuration');
  }
  
  return API_BASE_URL;
};
