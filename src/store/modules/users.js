
// src/store/modules/users.js
import usersService from '@/services/users';
import followService from '@/services/follow';

const state = {
  users: [],
  userProfiles: {},  // Store user profiles by ID
  followers: [],
  following: [],
  loading: false,
  error: null
};

const getters = {
  allUsers: state => state.users,
  getUserById: state => id => state.userProfiles[id],
  followers: state => state.followers,
  following: state => state.following
};

const actions = {
  async fetchUsers({ commit }) {
    commit('set_loading', true);
    try {
      const response = await usersService.getUsers();
      commit('set_users', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return [];
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchUserById({ commit }, id) {
    commit('set_loading', true);
    try {
      const response = await usersService.getUserById(id);
      commit('set_user_profile', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchUserByUsername({ commit }, username) {
    commit('set_loading', true);
    try {
      const response = await usersService.getUserByUsername(username);
      commit('set_user_profile', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchFollowers({ commit }) {
    commit('set_loading', true);
    try {
      const response = await followService.getFollowers();
      commit('set_followers', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return [];
    } finally {
      commit('set_loading', false);
    }
  },
  
  async fetchFollowing({ commit }) {
    commit('set_loading', true);
    try {
      const response = await followService.getFollowing();
      commit('set_following', response.data);
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      return [];
    } finally {
      commit('set_loading', false);
    }
  },
  
  async followUser({ commit, dispatch }, userId) {
    try {
      await followService.followUser(userId);
      await dispatch('fetchFollowing');
      return true;
    } catch (error) {
      commit('set_error', error.message);
      return false;
    }
  },
  
  async unfollowUser({ commit, dispatch }, userId) {
    try {
      await followService.unfollowUser(userId);
      await dispatch('fetchFollowing');
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
  
  set_users(state, users) {
    state.users = users;
  },
  
  set_user_profile(state, user) {
    state.userProfiles = {
      ...state.userProfiles,
      [user.id]: user
    };
  },
  
  set_followers(state, followers) {
    state.followers = followers;
  },
  
  set_following(state, following) {
    state.following = following;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
