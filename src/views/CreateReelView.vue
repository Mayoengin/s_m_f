<template>
    <div class="create-reel-view">
      <div class="container">
        <div class="mb-4">
          <router-link to="/reels" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i> Back to Reels
          </router-link>
        </div>
        
        <CreateReel />
      </div>
    </div>
  </template>
  
  <script>
  import CreateReel from '@/components/CreateReel.vue';
  
  export default {
    name: 'CreateReelView',
    components: {
      CreateReel
    }
  };
  </script>
  
  <style scoped>
  .create-reel-view {
    padding: 20px 0;
  }
  </style>