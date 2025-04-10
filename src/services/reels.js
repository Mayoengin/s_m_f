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
  
  createReel(reelData, config = {}) {
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('title', reelData.title);
    formData.append('description', reelData.description);
    
    // Check if videoFile exists and is a valid file
    if (reelData.videoFile && reelData.videoFile instanceof File) {
      console.log('Uploading video file:', {
        name: reelData.videoFile.name,
        type: reelData.videoFile.type,
        size: reelData.videoFile.size
      });
      
      // Ensure correct filename is preserved
      formData.append('video_file', reelData.videoFile, reelData.videoFile.name);
    } else {
      console.error('Invalid video file:', reelData.videoFile);
    }
    
    // Log all form data entries for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`Form data: ${key} = ${value instanceof File ? value.name : value}`);
    }
    
    return api.post('/reels/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // Add timeout for large files
      timeout: 60000, // 60 seconds
      ...config
    });
  },
  
  updateReel(id, reelData, config = {}) {
    const formData = new FormData();
    formData.append('title', reelData.title);
    formData.append('description', reelData.description);
    
    // Only append file if a new one is selected
    if (reelData.videoFile && reelData.videoFile instanceof File) {
      console.log('Updating with new video file:', {
        name: reelData.videoFile.name,
        type: reelData.videoFile.type,
        size: reelData.videoFile.size
      });
      
      formData.append('video_file', reelData.videoFile, reelData.videoFile.name);
    }
    
    return api.put(`/reels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000, // 60 seconds
      ...config
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