

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
    try {
      const response = await reelsService.getReels(limit, skip, userId);
      commit('set_reels', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return [];
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchReelById({ commit }, id) {
    commit('set_loading', true);
    try {
      const response = await reelsService.getReelById(id);
      commit('set_current_reel', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async createReel({ commit }, reelData) {
    commit('set_loading', true);
    try {
      const response = await reelsService.createReel(reelData);
      commit('add_reel', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async updateReel({ commit }, { id, reelData }) {
    commit('set_loading', true);
    try {
      const response = await reelsService.updateReel(id, reelData);
      commit('update_reel', response.data);
      
      if (state.currentReel && state.currentReel.id === id) {
        commit('set_current_reel', response.data);
      }
      
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async deleteReel({ commit }, id) {
    commit('set_loading', true);
    try {
      await reelsService.deleteReel(id);
      commit('remove_reel', id);
      return true;
    } catch (error) {
      commit('set_error', error.message);
      return false;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async likeReel({ commit }, reelId) {
    try {
      await reelsService.likeReel(reelId);
      commit('toggle_reel_like', reelId);
      return true;
    } catch (error) {
      commit('set_error', error.message);
      return false;
    }
  },
  
  async fetchReelComments({ commit }, reelId) {
    try {
      const response = await reelsService.getReelComments(reelId);
      commit('set_reel_comments', { reelId, comments: response.data });
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return [];
    }
  },
  
  async commentOnReel({ commit, dispatch }, { reelId, content }) {
    try {
      await reelsService.commentOnReel(reelId, content);
      await dispatch('fetchReelComments', reelId);
      return true;
    } catch (error) {
      commit('set_error', error.message);
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
  
  toggle_reel_like(state, reelId) {
    const reel = state.reels.find(reel => reel.id === reelId);
    if (reel) {
      reel.likes = reel.is_liked ? reel.likes - 1 : reel.likes + 1;
      reel.is_liked = !reel.is_liked;
    }
    
    if (state.currentReel && state.currentReel.id === reelId) {
      state.currentReel.likes = state.currentReel.is_liked ? 
        state.currentReel.likes - 1 : state.currentReel.likes + 1;
      state.currentReel.is_liked = !state.currentReel.is_liked;
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