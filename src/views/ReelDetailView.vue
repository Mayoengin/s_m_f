<template>
    <div class="reel-detail-view">
      <div class="container">
        <div class="mb-4">
          <router-link to="/reels" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i> Back to Reels
          </router-link>
        </div>
        
        <ReelDetail />
      </div>
    </div>
  </template>
  
  <script>
  import ReelDetail from '@/components/ReelDetail.vue';
  
  export default {
    name: 'ReelDetailView',
    components: {
      ReelDetail
    }
  };
  </script>
  
  <style scoped>
  .reel-detail-view {
    padding: 20px 0;
  }
  </style>