// src/store/modules/reels.js
import reelsService from '@/services/reels';

const state = {
  reels: [],
  currentReel: null,
  loading: false,
  error: null,
  reelComments: {}
};

const getters = {
  allReels: state => state.reels,
  getCurrentReel: state => state.currentReel,
  getReelComments: state => reelId => state.reelComments[reelId] || []
};

const actions = {
  async fetchReels({ commit }, { limit = 10, skip = 0, userId = null }) {
    commit('set_loading', true);
    commit('set_error', null);
    
    try {
      const response = await reelsService.getReels(limit, skip, userId);
      console.log('Reels fetched successfully:', response.data);
      commit('set_reels', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reels:', error);
      commit('set_error', error.message || 'Failed to fetch reels');
      return [];
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchReelById({ commit }, id) {
    commit('set_loading', true);
    commit('set_error', null);
    
    try {
      const response = await reelsService.getReelById(id);
      console.log('Reel fetched successfully:', response.data);
      commit('set_current_reel', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reel by ID:', error);
      commit('set_error', error.message || 'Failed to fetch reel');
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async createReel({ commit }, reelData) {
    commit('set_loading', true);
    commit('set_error', null);
    
    try {
      let config = {};
      if (reelData.config) {
        config = reelData.config;
        delete reelData.config;
      }
      
      const response = await reelsService.createReel(reelData, config);
      console.log('Reel created successfully:', response.data);
      commit('add_reel', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating reel:', error);
      commit('set_error', error.message || 'Failed to create reel');
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async updateReel({ commit }, { id, reelData, config = {} }) {
    commit('set_loading', true);
    commit('set_error', null);
    
    try {
      const response = await reelsService.updateReel(id, reelData, config);
      console.log('Reel updated successfully:', response.data);
      commit('update_reel', response.data);
      
      if (state.currentReel && state.currentReel.id === id) {
        commit('set_current_reel', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating reel:', error);
      commit('set_error', error.message || 'Failed to update reel');
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async deleteReel({ commit }, id) {
    commit('set_loading', true);
    commit('set_error', null);
    
    try {
      await reelsService.deleteReel(id);
      console.log('Reel deleted successfully:', id);
      commit('remove_reel', id);
      return true;
    } catch (error) {
      console.error('Error deleting reel:', error);
      commit('set_error', error.message || 'Failed to delete reel');
      return false;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async likeReel({ commit }, reelId) {
    commit('set_error', null);
    
    try {
      const response = await reelsService.likeReel(reelId);
      
      // Update the reel with the new vote count and like status
      commit('toggle_reel_like', {
        reelId, 
        votes: response.data.votes,
        isLiked: response.data.is_liked
      });
      
      return true;
    } catch (error) {
      console.error('Error liking reel:', error);
      commit('set_error', error.message || 'Failed to like reel');
      return false;
    }
  },
  
  async fetchReelComments({ commit }, reelId) {
    commit('set_error', null);
    
    try {
      const response = await reelsService.getReelComments(reelId);
      commit('set_reel_comments', { reelId, comments: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching reel comments:', error);
      commit('set_error', error.message || 'Failed to fetch comments');
      return [];
    }
  },
  
  async commentOnReel({ commit, dispatch }, { reelId, content }) {
    commit('set_error', null);
    
    try {
      await reelsService.commentOnReel(reelId, content);
      await dispatch('fetchReelComments', reelId);
      return true;
    } catch (error) {
      console.error('Error commenting on reel:', error);
      commit('set_error', error.message || 'Failed to post comment');
      return false;
    }
  }
};

const mutations = {
  set_loading(state, status) {
    state.loading = status;
  },
  
  set_error(state, error) {
    state.error = error;
  },
  
  set_reels(state, reels) {
    state.reels = reels;
  },
  
  add_reel(state, reel) {
    state.reels.unshift(reel);
  },
  
  set_current_reel(state, reel) {
    state.currentReel = reel;
  },
  
  update_reel(state, updatedReel) {
    const index = state.reels.findIndex(reel => reel.id === updatedReel.id);
    if (index !== -1) {
      state.reels.splice(index, 1, updatedReel);
    }
  },
  
  remove_reel(state, id) {
    state.reels = state.reels.filter(reel => reel.id !== id);
    if (state.currentReel && state.currentReel.id === id) {
      state.currentReel = null;
    }
  },
  
  toggle_reel_like(state, { reelId, votes, isLiked }) {
    const reel = state.reels.find(reel => reel.id === reelId);
    if (reel) {
      reel.votes = votes;
      reel.is_liked = isLiked;
    }
    
    if (state.currentReel && state.currentReel.id === reelId) {
      state.currentReel.votes = votes;
      state.currentReel.is_liked = isLiked;
    }
  },
  
  set_reel_comments(state, { reelId, comments }) {
    state.reelComments = {
      ...state.reelComments,
      [reelId]: comments
    };
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};