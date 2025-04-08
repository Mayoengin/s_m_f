// src/App.vue
<template>
  <div id="app">
    <Navbar v-if="isAuthenticated" />
    <main class="container py-4">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Navbar from '@/components/common/Navbar.vue';
import AppFooter from '@/components/common/AppFooter.vue';

export default {
  name: 'App',
  components: {
    Navbar,
    AppFooter
  },
  setup() {
    const store = useStore();
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    
    onMounted(async () => {
      // If user is logged in, fetch their profile
      if (isAuthenticated.value) {
        await store.dispatch('auth/fetchCurrentUser');
      }
    });
    
    return {
      isAuthenticated
    };
  }
};
</script>

<style>
/* You can add global styles here */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>

// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import '@fortawesome/fontawesome-free/css/all.css';

createApp(App)
  .use(store)
  .use(router)
  .mount('#app');
