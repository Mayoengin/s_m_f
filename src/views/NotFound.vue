// src/views/NotFound.vue
<template>
  <div class="not-found text-center py-5">
    <div class="container">
      <i class="fas fa-search fa-4x text-muted mb-4"></i>
      <h1 class="display-4">Page Not Found</h1>
      <p class="lead">The page you're looking for doesn't exist or has been moved.</p>
      <router-link to="/" class="btn btn-primary btn-lg mt-3">
        <i class="fas fa-home me-2"></i> Go Home
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
};
</script>