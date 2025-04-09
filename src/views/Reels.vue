<template>
    <div class="reels-page">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Reels</h1>
          <router-link to="/create-reel" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i> Create Reel
          </router-link>
        </div>
        
        <ReelsFeed />
      </div>
    </div>
  </template>
  
  <script>
  import ReelsFeed from '@/components/ReelsFeed.vue';
  
  export default {
    name: 'ReelsView',
    components: {
      ReelsFeed
    }
  };
  </script>
  
  <style scoped>
  .reels-page {
    padding: 20px 0;
  }
  </style>