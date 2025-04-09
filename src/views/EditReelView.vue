<template>
    <div class="edit-reel-view">
      <div class="container">
        <div class="mb-4">
          <router-link :to="`/reels/${$route.params.id}`" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i> Back to Reel
          </router-link>
        </div>
        
        <CreateReel />
      </div>
    </div>
  </template>
  
  <script>
  import CreateReel from '@/components/CreateReel.vue';
  
  export default {
    name: 'EditReelView',
    components: {
      CreateReel
    }
  };
  </script>
  
  <style scoped>
  .edit-reel-view {
    padding: 20px 0;
  }
  </style>
  