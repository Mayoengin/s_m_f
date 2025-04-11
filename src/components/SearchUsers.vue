<template>
    <div class="search-users-container">
      <h3 class="mb-4">User Search</h3>
      
      <!-- Search form -->
      <div class="mb-4">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search for users..." 
            v-model="searchQuery"
            @keyup.enter="searchUsers"
          >
          <button 
            class="btn btn-primary" 
            type="button" 
            @click="searchUsers"
            :disabled="loading"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-search"></i>
          </button>
        </div>
      </div>
      
      <!-- Error message -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <!-- Results -->
      <div v-if="hasSearched">
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Searching users...</p>
        </div>
        
        <div v-else-if="users.length === 0" class="alert alert-info">
          <i class="fas fa-user-slash me-2"></i>
          No users found matching "{{ lastSearchQuery }}".
        </div>
        
        <div v-else>
          <h5 class="mb-3">Results for "{{ lastSearchQuery }}"</h5>
          
          <div class="list-group">
            <div v-for="user in users" :key="user.id" class="list-group-item user-item">
              <div class="d-flex align-items-center">
                <div class="user-avatar bg-primary text-white me-3">
                  {{ getUserInitial(user.username) }}
                </div>
                <div class="flex-grow-1">
                  <router-link :to="`/profile/${user.username}`" class="fw-bold text-decoration-none stretched-link">
                    {{ user.username }}
                  </router-link>
                  <p class="text-muted mb-0 small" v-if="user.email">{{ user.email }}</p>
                </div>
                <div>
                  <button 
                    v-if="!isCurrentUser(user.id) && !isFollowing(user.id)"
                    class="btn btn-sm btn-primary follow-btn"
                    @click.stop="followUser(user.id)"
                    :disabled="followingInProgress.includes(user.id)"
                  >
                    <span v-if="followingInProgress.includes(user.id)" class="spinner-border spinner-border-sm"></span>
                    <span v-else>Follow</span>
                  </button>
                  <button 
                    v-if="!isCurrentUser(user.id) && isFollowing(user.id)"
                    class="btn btn-sm btn-outline-primary follow-btn"
                    @click.stop="unfollowUser(user.id)"
                    :disabled="followingInProgress.includes(user.id)"
                  >
                    <span v-if="followingInProgress.includes(user.id)" class="spinner-border spinner-border-sm"></span>
                    <span v-else>Unfollow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useStore } from 'vuex';
  
  export default {
    name: 'SearchUsers',
    
    setup() {
      const store = useStore();
      
      const searchQuery = ref('');
      const lastSearchQuery = ref('');
      const hasSearched = ref(false);
      const loading = ref(false);
      const error = ref('');
      const followingInProgress = ref([]);
      
      const currentUser = computed(() => store.getters['auth/currentUser'] || {});
      const following = computed(() => store.getters['users/following'] || []);
      
      // We'll reuse the users from the store, but filter them by search query
      const allUsers = computed(() => store.getters['users/allUsers'] || []);
      const users = ref([]);
      
      const isCurrentUser = (userId) => {
        return currentUser.value.id === userId;
      };
      
      const isFollowing = (userId) => {
        return following.value.some(user => user.id === userId);
      };
      
      const getUserInitial = (username) => {
        return username?.charAt(0).toUpperCase() || '';
      };
      
      const searchUsers = async () => {
        if (!searchQuery.value.trim()) return;
        
        loading.value = true;
        error.value = '';
        hasSearched.value = true;
        lastSearchQuery.value = searchQuery.value.trim();
        
        try {
          // First, make sure we have all users loaded
          if (allUsers.value.length === 0) {
            await store.dispatch('users/fetchUsers');
          }
          
          // Filter users by search query (case insensitive)
          const query = lastSearchQuery.value.toLowerCase();
          users.value = allUsers.value.filter(user => 
            user.username.toLowerCase().includes(query) || 
            (user.email && user.email.toLowerCase().includes(query))
          );
        } catch (err) {
          error.value = 'Failed to search users. Please try again.';
          console.error('User search error:', err);
        } finally {
          loading.value = false;
        }
      };
      
      const followUser = async (userId) => {
        if (followingInProgress.value.includes(userId)) return;
        
        followingInProgress.value.push(userId);
        try {
          await store.dispatch('users/followUser', userId);
        } catch (err) {
          error.value = 'Failed to follow user. Please try again.';
        } finally {
          followingInProgress.value = followingInProgress.value.filter(id => id !== userId);
        }
      };
      
      const unfollowUser = async (userId) => {
        if (followingInProgress.value.includes(userId)) return;
        
        followingInProgress.value.push(userId);
        try {
          await store.dispatch('users/unfollowUser', userId);
        } catch (err) {
          error.value = 'Failed to unfollow user. Please try again.';
        } finally {
          followingInProgress.value = followingInProgress.value.filter(id => id !== userId);
        }
      };
      
      return {
        searchQuery,
        lastSearchQuery,
        hasSearched,
        loading,
        error,
        users,
        followingInProgress,
        isCurrentUser,
        isFollowing,
        getUserInitial,
        searchUsers,
        followUser,
        unfollowUser
      };
    }
  };
  </script>
  
  <style scoped>
  .search-users-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
  }
  
  .user-item {
    transition: background-color 0.2s;
    border-left: none;
    border-right: none;
    position: relative;
  }
  
  .user-item:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  .follow-btn {
    min-width: 80px;
    z-index: 2;
    position: relative;
  }
  </style>