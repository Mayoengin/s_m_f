// src/store/modules/auth.js
import authService from '@/services/auth';
import router from '@/router';

const state = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user')) || null,
  status: ''
};

const getters = {
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  currentUser: state => state.user
};

const actions = {
  async login({ commit }, { username, password }) {
    commit('auth_request');
    try {
      console.log('Login action started with username:', username);
      const response = await authService.login(username, password);
      
      console.log('Login response received:', response.data);
      
      const accessToken = response.data.access_token;
      
      if (!accessToken) {
        console.error('No token in response:', response.data);
        commit('auth_error');
        return false;
      }
      
      localStorage.setItem('token', accessToken);
      commit('auth_success', accessToken);
      
      // Get user profile after successful login
      try {
        await commit('fetchCurrentUser');
        return true;
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Still return true because login was successful
        return true;
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error);
      commit('auth_error');
      localStorage.removeItem('token');
      return false;
    }
  },
  
  async register({ commit, dispatch }, userData) {
    commit('auth_request');
    try {
      await authService.register(userData);
      
      // After registration, log user in
      return dispatch('login', {
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      commit('auth_error');
      return false;
    }
  },
  
  async fetchCurrentUser({ commit }) {
    try {
      const response = await authService.getCurrentUser();
      const user = response.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      commit('set_user', user);
      return user;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      commit('auth_error');
      return null;
    }
  },
  
  logout({ commit }) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    commit('logout');
    router.push('/login');
  }
};

const mutations = {
  auth_request(state) {
    state.status = 'loading';
  },
  
  auth_success(state, token) {
    state.status = 'success';
    state.token = token;
  },
  
  auth_error(state) {
    state.status = 'error';
    state.token = '';
  },
  
  set_user(state, user) {
    state.user = user;
  },
  
  logout(state) {
    state.status = '';
    state.token = '';
    state.user = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};