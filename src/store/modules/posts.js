// src/store/modules/posts.js
import postsService from '@/services/posts';

const state = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null
};

const getters = {
  allPosts: state => state.posts,
  getPostById: state => id => state.posts.find(post => post.id === id),
  getCurrentPost: state => state.currentPost
};

const actions = {
  async fetchPosts({ commit }, { limit, skip, search }) {
    commit('set_loading', true);
    try {
      const response = await postsService.getPosts(limit, skip, search);
      commit('set_posts', response.data);
    } catch (error) {
      commit('set_error', error.message);
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchPostById({ commit }, id) {
    commit('set_loading', true);
    try {
      const response = await postsService.getPostById(id);
      commit('set_current_post', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async createPost({ commit }, postData) {
    // Removed unused dispatch parameter
    commit('set_loading', true);
    try {
      const response = await postsService.createPost(postData);
      // Add the new post to the posts list instead of refreshing
      commit('add_post', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async updatePost({ commit }, { id, postData }) {
    // Removed unused dispatch parameter
    commit('set_loading', true);
    try {
      const response = await postsService.updatePost(id, postData);
      
      // Update post in current list if exists
      commit('update_post', response.data);
      
      // If it's the current post, update it too
      if (state.currentPost && state.currentPost.id === id) {
        commit('set_current_post', response.data);
      }
      
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async deletePost({ commit }, id) {
    // Removed unused dispatch parameter
    commit('set_loading', true);
    try {
      await postsService.deletePost(id);
      commit('remove_post', id);
      return true;
    } catch (error) {
      commit('set_error', error.message);
      return false;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async votePost({ commit }, postId) {
    try {
      await postsService.votePost(postId);
      commit('toggle_vote', postId);
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
  
  set_posts(state, posts) {
    state.posts = posts;
  },
  
  // Added a mutation to add a single post
  add_post(state, post) {
    state.posts.unshift(post); // Add to beginning of the array
  },
  
  set_current_post(state, post) {
    state.currentPost = post;
  },
  
  update_post(state, updatedPost) {
    const index = state.posts.findIndex(post => post.id === updatedPost.id);
    if (index !== -1) {
      state.posts.splice(index, 1, updatedPost);
    }
  },
  
  remove_post(state, id) {
    state.posts = state.posts.filter(post => post.id !== id);
    if (state.currentPost && state.currentPost.id === id) {
      state.currentPost = null;
    }
  },
  
  toggle_vote(state, postId) {
    // This is a simplified version. In reality, we would re-fetch the post
    // to get the accurate vote count after a vote action
    const post = state.posts.find(post => post.id === postId);
    if (post) {
      // This assumes the backend toggles votes (adds if none, removes if exists)
      // We would need a more complex logic based on your specific requirements
      post.votes = post.hasVoted ? post.votes - 1 : post.votes + 1;
      post.hasVoted = !post.hasVoted;
    }
    
    if (state.currentPost && state.currentPost.id === postId) {
      state.currentPost.votes = state.currentPost.hasVoted ? 
        state.currentPost.votes - 1 : state.currentPost.votes + 1;
      state.currentPost.hasVoted = !state.currentPost.hasVoted;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};