// src/services/posts.js
import api from './api';

export default {
  getPosts(limit = 10, skip = 0, search = '') {
    return api.get(`/posts/?limit=${limit}&skip=${skip}&search=${search}`);
  },
  
  getPostById(id) {
    return api.get(`/posts/${id}`);
  },
  
  getLatestPost() {
    return api.get('/posts/latest');
  },
  
  createPost(postData) {
    return api.post('/posts/', postData);
  },
  
  updatePost(id, postData) {
    return api.put(`/posts/${id}`, postData);
  },
  
  deletePost(id) {
    return api.delete(`/posts/${id}`);
  },
  
  votePost(postId) {
    return api.post('/vote/', { post_id: postId });
  }
};
