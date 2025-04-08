import axios from 'axios';
import router from '@/router'; // Import your router

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Interceptor Error:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request
    });

    // Handle specific error scenarios
    if (error.code === 'ERR_NETWORK') {
      // Network error handling
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
          // Forbidden
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