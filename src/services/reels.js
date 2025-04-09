// src/services/reels.js
import api from './api';

export default {
  getReels(limit = 10, skip = 0, userId = null) {
    const userParam = userId ? `&user_id=${userId}` : '';
    return api.get(`/reels/?limit=${limit}&skip=${skip}${userParam}`);
  },
  
  getReelById(id) {
    return api.get(`/reels/${id}`);
  },
  
  createReel(reelData) {
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('title', reelData.title);
    formData.append('description', reelData.description);
    formData.append('video_file', reelData.videoFile);
    
    return api.post('/reels/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updateReel(id, reelData) {
    const formData = new FormData();
    formData.append('title', reelData.title);
    formData.append('description', reelData.description);
    
    // Only append file if a new one is selected
    if (reelData.videoFile) {
      formData.append('video_file', reelData.videoFile);
    }
    
    return api.put(`/reels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  deleteReel(id) {
    return api.delete(`/reels/${id}`);
  },
  
  likeReel(reelId) {
    return api.post('/reels/like/', { reel_id: reelId });
  },
  
  commentOnReel(reelId, content) {
    return api.post(`/reels/${reelId}/comment`, { content });
  },
  
  getReelComments(reelId) {
    return api.get(`/reels/${reelId}/comments`);
  }
};