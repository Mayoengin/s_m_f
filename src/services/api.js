import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.VUE_APP_API_BASE_URL 
    : 'http://localhost:8000',
  timeout: 30000, // Extended default timeout
  headers: {
    'Accept': 'application/json'
    // Remove default Content-Type to allow browser to set it with boundary for FormData
  }
});

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
  
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data instanceof FormData ? 'FormData' : config.data
  });
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
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
        headers: error.config.headers
      } : 'No config'
    });

    // Handle specific error scenarios
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Unable to connect to the server');
      // Optional: show a toast or notification
    }

    if (error.response) {
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

export default api;