<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link class="navbar-brand" to="/">SocialApp</router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/create-post">Create Post</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <div class="dropdown">
            <a class="btn btn-primary dropdown-toggle d-flex align-items-center" href="#" role="button" id="userMenu" data-bs-toggle="dropdown">
              <span class="me-2">{{ currentUser.username }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
              <li>
                <router-link class="dropdown-item" :to="`/profile/${currentUser.username}`">My Profile</router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'AppNavbar', // Changed from 'Navbar' to 'AppNavbar'
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const currentUser = computed(() => store.getters['auth/currentUser'] || {});
    
    const logout = () => {
      store.dispatch('auth/logout');
      router.push('/login');
    };
    
    return {
      currentUser,
      logout
    };
  }
};
</script>