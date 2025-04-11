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
      // Fix any existing duplicated profile picture paths
      store.dispatch('users/fixProfilePicturePaths');
      
      // If user is logged in but no user object, fetch profile
      if (isAuthenticated.value) {
        const userData = await store.dispatch('auth/fetchCurrentUser');
        
        // If user data contains a duplicated profile picture path, fix it
        if (userData && userData.profile_picture && 
            userData.profile_picture.includes('/static/profile_pictures/static/profile_pictures/')) {
          
          // Create updated user with fixed path
          const updatedUser = {
            ...userData,
            profile_picture: userData.profile_picture.replace(
              '/static/profile_pictures/static/profile_pictures/', 
              '/static/profile_pictures/'
            )
          };
          
          // Update user in store and localStorage
          store.commit('auth/set_user', updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    });
   
    return {
      isAuthenticated
    };
  }
};
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>