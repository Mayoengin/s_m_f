// src/services/comments.js
import api from './api';

export default {
  getComments(postId) {
    return api.get(`/posts/${postId}/comments`);
  },
  
  createComment(postId, content) {
    return api.post(`/posts/${postId}/comment`, { content });
  }
};
