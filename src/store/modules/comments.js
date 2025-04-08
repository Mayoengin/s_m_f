
// src/store/modules/comments.js
import commentsService from '@/services/comments';

const state = {
  comments: {},  // Using an object to store comments by post ID
  loading: false,
  error: null
};

const getters = {
  getCommentsByPostId: state => postId => state.comments[postId] || []
};

const actions = {
  async fetchComments({ commit }, postId) {
    commit('set_loading', true);
    try {
      const response = await commentsService.getComments(postId);
      commit('set_comments', { postId, comments: response.data });
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return [];
    } finally {
      commit('set_loading', false);
    }
  },
  
  async createComment({ commit, dispatch }, { postId, content }) {
    commit('set_loading', true);
    try {
      const response = await commentsService.createComment(postId, content);
      // Refresh comments for this post
      await dispatch('fetchComments', postId);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
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
  
  set_comments(state, { postId, comments }) {
    state.comments = {
      ...state.comments,
      [postId]: comments
    };
  },
  
  add_comment(state, { postId, comment }) {
    if (!state.comments[postId]) {
      state.comments[postId] = [];
    }
    state.comments[postId].push(comment);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
