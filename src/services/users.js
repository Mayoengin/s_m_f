// src/services/users.js - Complete update
import api from './api';

// Helper function to normalize profile picture path
function normalizeProfilePicturePath(path) {
  if (!path) return '';
  
  // If the path contains 'static/profile_pictures', make sure it has a leading slash
  if (path.includes('static/profile_pictures')) {
    // Remove any duplicated path segments first
    path = path.replace(/static\/profile_pictures\/static\/profile_pictures/g, 'static/profile_pictures');
    
    // Add leading slash if missing
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return path;
  }
  
  // If it's just a filename, add the complete path
  return `/static/profile_pictures/${path}`;
}

export default {
  getUsers() {
    return api.get('/users/');
  },
  
  getUserById(id) {
    return api.get(`/users/id/${id}`);
  },
  
  getUserByUsername(username) {
    return api.get(`/users/username/${username}`);
  },
  
  updateUser(id, userData) {
    return api.put(`/users/${id}`, userData);
  },
  
  deleteUser(id) {
    return api.delete(`/users/${id}`);
  },
  searchUsers(query) {
    return api.get(`/users/search?q=${encodeURIComponent(query)}`);
  },
  
  updateUserProfile(userData) {
    return api.put('/users/me', userData);
  },
  
  uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/users/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformResponse: [(data) => {
        try {
          // Parse the JSON response
          const parsed = JSON.parse(data);
          
          // If the response includes a profile_picture path, normalize it
          if (parsed && parsed.profile_picture) {
            parsed.profile_picture = normalizeProfilePicturePath(parsed.profile_picture);
          }
          
          return parsed;
        } catch (error) {
          // In case the response is not valid JSON
          console.error('Error parsing profile picture response:', error);
          return data;
        }
      }]
    });
  },
  
  uploadBackgroundImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/users/upload-background-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};