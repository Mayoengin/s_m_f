<template>
    <div class="search-view container">
      <div class="row">
        <div class="col-md-3 d-none d-md-block">
          <!-- Left sidebar -->
          <div class="card mb-4">
            <div class="card-header bg-white">
              <h5 class="mb-0">Search Options</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <button 
                  class="list-group-item list-group-item-action"
                  :class="{ 'active': activeTab === 'users' }"
                  @click="setActiveTab('users')"
                >
                  <i class="fas fa-users me-2"></i> Users
                </button>
                <button 
                  class="list-group-item list-group-item-action"
                  :class="{ 'active': activeTab === 'posts' }"
                  @click="setActiveTab('posts')"
                >
                  <i class="fas fa-file-alt me-2"></i> Posts
                </button>
                <button 
                  class="list-group-item list-group-item-action"
                  :class="{ 'active': activeTab === 'reels' }"
                  @click="setActiveTab('reels')"
                >
                  <i class="fas fa-film me-2"></i> Reels
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-9">
          <!-- Mobile view tabs -->
          <div class="d-md-none mb-4">
            <div class="btn-group w-100">
              <button 
                class="btn btn-outline-primary"
                :class="{ 'active': activeTab === 'users' }"
                @click="setActiveTab('users')"
              >
                <i class="fas fa-users me-1"></i> Users
              </button>
              <button 
                class="btn btn-outline-primary"
                :class="{ 'active': activeTab === 'posts' }"
                @click="setActiveTab('posts')"
              >
                <i class="fas fa-file-alt me-1"></i> Posts
              </button>
              <button 
                class="btn btn-outline-primary"
                :class="{ 'active': activeTab === 'reels' }"
                @click="setActiveTab('reels')"
              >
                <i class="fas fa-film me-1"></i> Reels
              </button>
            </div>
          </div>
          
          <!-- Search content -->
          <div class="card">
            <div class="card-body">
              <div v-if="activeTab === 'users'">
                <SearchUsers />
              </div>
              <div v-else-if="activeTab === 'posts'">
                <div class="text-center py-5">
                  <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                  <h4>Post Search</h4>
                  <p class="text-muted">This feature will be coming soon!</p>
                </div>
              </div>
              <div v-else-if="activeTab === 'reels'">
                <div class="text-center py-5">
                  <i class="fas fa-film fa-3x text-muted mb-3"></i>
                  <h4>Reels Search</h4>
                  <p class="text-muted">This feature will be coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import SearchUsers from '@/components/SearchUsers.vue';
  
  export default {
    name: 'SearchView',
    components: {
      SearchUsers
    },
    setup() {
      const route = useRoute();
      const activeTab = ref('users');
      
      const setActiveTab = (tab) => {
        activeTab.value = tab;
      };
      
      onMounted(() => {
        // Check if there's a tab parameter in the URL
        if (route.query.tab && ['users', 'posts', 'reels'].includes(route.query.tab)) {
          activeTab.value = route.query.tab;
        }
      });
      
      return {
        activeTab,
        setActiveTab
      };
    }
  };
  </script>
  
  <style scoped>
  .search-view {
    padding: 2rem 0;
  }
  
  .list-group-item-action.active {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }
  
  .btn-group .btn.active {
    background-color: #0d6efd;
    color: white;
  }
  </style>