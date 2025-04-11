// src/store/modules/users.js - Complete update
import usersService from '@/services/users';
import followService from '@/services/follow';

// Helper function to normalize profile picture paths
function normalizeProfilePicturePath(path) {
  if (!path) return '';
  
  // Remove any duplicated path segments first
  path = path.replace(/static\/profile_pictures\/static\/profile_pictures/g, 'static/profile_pictures');
  path = path.replace(/\/static\/profile_pictures\/static\/profile_pictures/g, '/static/profile_pictures');
  
  // Ensure path has a leading slash if it contains profile_pictures
  if (path.includes('static/profile_pictures') && !path.startsWith('/')) {
    path = '/' + path;
  }
  
  return path;
}

// Helper function to normalize user object's profile picture
function normalizeUserProfilePicture(user) {
  if (!user || !user.profile_picture) return user;
  
  return {
    ...user,
    profile_picture: normalizeProfilePicturePath(user.profile_picture)
  };
}

const state = {
  users: [],
  userProfiles: {},  // Store user profiles by ID
  followers: [],
  following: [],
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
  searchError: null
};

const getters = {
  allUsers: state => state.users,
  getUserById: state => id => state.userProfiles[id],
  followers: state => state.followers,
  following: state => state.following,
  searchResults: state => state.searchResults,
  searchLoading: state => state.searchLoading,
  searchError: state => state.searchError
};

const actions = {
  async fetchUsers({ commit }) {
    commit('set_loading', true);
    try {
      const response = await usersService.getUsers();
      // Normalize profile pictures before setting users
      const normalizedUsers = response.data.map(user => normalizeUserProfilePicture(user));
      commit('set_users', normalizedUsers);
      return normalizedUsers;
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
      const normalizedUser = normalizeUserProfilePicture(response.data);
      commit('set_user_profile', normalizedUser);
      return normalizedUser;
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
      const normalizedUser = normalizeUserProfilePicture(response.data);
      commit('set_user_profile', normalizedUser);
      return normalizedUser;
    } catch (error) {
      commit('set_error', error.message);
      return null;
    } finally {
      commit('set_loading', false);
    }
  },
  async searchUsers({ commit }, query) {
    commit('set_search_loading', true);
    commit('set_search_error', null);
    
    try {
      const response = await usersService.searchUsers(query);
      commit('set_search_results', response.data);
      return response.data;
    } catch (error) {
      commit('set_search_error', error.message);
      return [];
    } finally {
      commit('set_search_loading', false);
    }
  },
  async fetchFollowers({ commit }) {
    commit('set_loading', true);
    try {
      const response = await followService.getFollowers();
      // Normalize profile pictures for followers
      const normalizedFollowers = response.data.map(user => normalizeUserProfilePicture(user));
      commit('set_followers', normalizedFollowers);
      return normalizedFollowers;
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
      // Normalize profile pictures for following
      const normalizedFollowing = response.data.map(user => normalizeUserProfilePicture(user));
      commit('set_following', normalizedFollowing);
      return normalizedFollowing;
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
  },
  
  async updateUser({ commit }, userData) {
    commit('set_loading', true);
    try {
      const response = await usersService.updateUserProfile(userData);
      const normalizedUser = normalizeUserProfilePicture(response.data);
      commit('set_user_profile', normalizedUser);
      return normalizedUser;
    } catch (error) {
      commit('set_error', error.message);
      throw error;
    } finally {
      commit('set_loading', false);
    }
  },
  
  async uploadProfilePicture({ commit, rootGetters }, file) {
    commit('set_loading', true);
    try {
      const response = await usersService.uploadProfilePicture(file);
      
      // Get the current user
      const currentUser = rootGetters['auth/currentUser'];
      
      if (response.data && currentUser) {
        // Get the normalized profile picture path from the response
        const profilePicture = normalizeProfilePicturePath(response.data.profile_picture);
        
        // Update user in auth store with the normalized path
        const updatedUser = {
          ...currentUser,
          profile_picture: profilePicture
        };
        
        commit('auth/set_user', updatedUser, { root: true });
        
        // Update user in users store
        commit('update_user', updatedUser);
        commit('set_user_profile', updatedUser);
        
        // Update local storage as well
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Debug the final value
        console.log('Final profile picture path saved:', profilePicture);
      }
      
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      throw error;
    } finally {
      commit('set_loading', false);
    }
  },
  async uploadBackgroundImage({ commit, rootGetters }, file) {
    commit('set_loading', true);
    try {
      const response = await usersService.uploadBackgroundImage(file);
      
      // Get the current user
      const currentUser = rootGetters['auth/currentUser'];
      
      if (response.data && currentUser) {
        // Update user in auth store with the new background image
        const updatedUser = {
          ...currentUser,
          background_image: response.data.background_image
        };
        
        commit('auth/set_user', updatedUser, { root: true });
        
        // Update local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      commit('set_error', error.message);
      throw error;
    } finally {
      commit('set_loading', false);
    }
  },
  async fixProfilePicturePaths({ commit, rootGetters }) {
    // Fix all profiles in the store
    commit('fix_profile_picture_paths');
    
    // Fix the current user's profile in auth store
    const currentUser = rootGetters['auth/currentUser'];
    if (currentUser && currentUser.profile_picture) {
      const fixedPath = normalizeProfilePicturePath(currentUser.profile_picture);
      
      if (fixedPath !== currentUser.profile_picture) {
        const updatedUser = {
          ...currentUser,
          profile_picture: fixedPath
        };
        
        commit('auth/set_user', updatedUser, { root: true });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
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
  },
  set_search_results(state, users) {
    state.searchResults = users;
  },
  
  set_search_loading(state, status) {
    state.searchLoading = status;
  },
  
  set_search_error(state, error) {
    state.searchError = error;
  },
  
  update_user(state, user) {
    // Find the user in the users array and update it
    const index = state.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      state.users[index] = user;
    }
  },
  
  fix_profile_picture_paths(state) {
    // Fix paths in users array
    state.users = state.users.map(user => normalizeUserProfilePicture(user));
    
    // Fix paths in userProfiles
    Object.keys(state.userProfiles).forEach(userId => {
      state.userProfiles[userId] = normalizeUserProfilePicture(state.userProfiles[userId]);
    });
    
    // Fix paths in followers and following
    state.followers = state.followers.map(user => normalizeUserProfilePicture(user));
    state.following = state.following.map(user => normalizeUserProfilePicture(user));
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};