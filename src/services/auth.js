import api from './api';

export default {
  login(username, password) {
    // Create FormData object for proper URL encoding
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    // Extensive logging
    console.log('Login Request Details:', {
      url: '/users/login',
      method: 'POST',
      data: { username } // Don't log password
    });
    
    return api.post('/users/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch(error => {
      // Log detailed error information
      console.error('Detailed Login Error:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
        config: error.config
      });
      throw error;
    });
  },
  
  register(userData) {
    return api.post('/users/', userData);
  },
  
  getCurrentUser() {
    return api.get('/users/me');
  }
};