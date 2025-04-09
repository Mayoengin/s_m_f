
// src/components/common/AppFooter.vue
<template>
  <footer class="bg-light text-center py-3 mt-auto">
    <div class="container">
      <p class="mb-0">© {{ currentYear }} SocialApp. All rights reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  }
};
</script>
