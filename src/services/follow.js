
// src/services/follow.js
import api from './api';

export default {
  followUser(userId) {
    return api.post(`/users/follow/${userId}`);
  },
  
  unfollowUser(userId) {
    return api.post(`/users/unfollow/${userId}`);
  },
  
  getFollowers() {
    return api.get('/users/followers');
  },
  
  getFollowing() {
    return api.get('/users/following');
  }
};
