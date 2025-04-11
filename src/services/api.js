import axios from 'axios';
import router from '@/router';

// Create axios instance with configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.VUE_APP_API_BASE_URL 
    : 'http://localhost:8000',
  timeout: 30000, // Extended default timeout
  headers: {
    'Accept': 'application/json'
    // Removed default Content-Type to allow proper FormData handling
  }
});

// Add a response interceptor for debugging
api.interceptors.response.use(
  response => {
    // Log profile picture paths for debugging
    if (response.config.url.includes('profile-picture') || 
        (response.data && response.data.profile_picture)) {
      console.log('API Response with profile picture:', {
        url: response.config.url,
        method: response.config.method,
        profilePicture: response.data.profile_picture
      });
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);
// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't override Content-Type for FormData requests
  if (!config.headers['Content-Type'] && 
      !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  
  // Log outgoing requests (optional, helpful for debugging)
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: {
      ...config.headers,
      Authorization: config.headers.Authorization ? '**TOKEN**' : undefined
    },
    data: config.data instanceof FormData ? 'FormData' : config.data
  });
  
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => {
    // Optional logging for successful responses
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  error => {
    // Comprehensive error logging
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers ? {
          ...error.config.headers,
          Authorization: error.config.headers.Authorization ? '**TOKEN**' : undefined
        } : 'No headers'
      } : 'No config'
    });

    // Handle specific error scenarios
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Unable to connect to the server');
      // Optional: show a toast or notification
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login or logout
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          console.error('Access Forbidden');
          break;
        case 404:
          console.error('Resource Not Found');
          break;
        case 500:
          console.error('Internal Server Error');
          break;
      }
    }

    return Promise.reject(error);
  }
);

// Test the API connection on startup
const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', api.defaults.baseURL);
    // Try a simple GET request to the API root or a health endpoint
    // You might need to adjust this to a valid endpoint on your API
    const response = await api.get('/');
    console.log('API connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('API connection test failed:', error.message);
    
    // Try to provide more helpful information about the connection issue
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error details:', {
        baseURL: api.defaults.baseURL,
        message: 'Unable to connect to the API server. Possible causes:',
        causes: [
          '1. Backend server is not running',
          '2. CORS is not configured on the backend',
          '3. Backend URL is incorrect',
          '4. Network/firewall is blocking the connection'
        ],
        suggestions: [
          '- Check that your backend server is running',
          '- Ensure CORS is properly configured',
          '- Verify the API URL is correct',
          '- Try accessing the API URL directly in your browser'
        ]
      });
    }
    return false;
  }
};

// Expose the test function
api.testConnection = testApiConnection;

// Uncomment to test the connection on startup
// testApiConnection();

export default api;