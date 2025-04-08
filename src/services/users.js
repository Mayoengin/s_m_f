
// src/services/users.js
import api from './api';

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
  }
};