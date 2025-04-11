<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="fas fa-share-alt me-2"></i>
        SocialConnect
      </router-link>
      
      <button class="navbar-toggler" type="button" @click="toggleNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" :class="{ 'show': navbarOpen }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/" exact>
              <i class="fas fa-home me-1"></i> Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/reels">
              <i class="fas fa-film me-1"></i> Reels
            </router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <router-link class="nav-link" :to="`/profile/${currentUser.username}`">
              <i class="fas fa-user me-1"></i> Profile
            </router-link>
          </li>
        </ul>
        
        <div class="d-flex">
          <!-- Search Form -->
          <form class="d-flex me-2" @submit.prevent="handleSearch">
          <input 
            class="form-control me-2" 
            type="search" 
            placeholder="Search" 
            v-model="searchQuery"
            aria-label="Search"
          >
          <button class="btn btn-outline-primary" type="submit">
            <i class="fas fa-search"></i>
          </button>
        </form>
          <!-- Auth buttons -->
          <div v-if="!isAuthenticated">
            <router-link to="/login" class="btn btn-outline-primary me-2">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Register</router-link>
          </div>
          
          <!-- User menu when logged in (custom implementation) -->
          <div v-else class="custom-dropdown" v-click-outside="closeDropdown">
            <button 
              class="btn btn-outline-secondary dropdown-toggle" 
              type="button"
              @click="toggleDropdown"
            >
              <i class="fas fa-user-circle me-1"></i>
              {{ currentUser.username }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ 'show': dropdownOpen }">
              <li>
                <router-link class="dropdown-item" :to="`/profile/${currentUser.username}`">
                  <i class="fas fa-user me-2"></i> My Profile
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/create-post">
                  <i class="fas fa-edit me-2"></i> Create Post
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/create-reel">
                  <i class="fas fa-film me-2"></i> Create Reel
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item text-danger" @click="logout">
                  <i class="fas fa-sign-out-alt me-2"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
  
  <!-- Spacer to prevent navbar from overlapping content -->
  <div style="height: 60px;"></div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'NavBar',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const searchQuery = ref('');
    const dropdownOpen = ref(false);
    const navbarOpen = ref(false);
    
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    const currentUser = computed(() => store.getters['auth/currentUser']);
    
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };
    
    const closeDropdown = () => {
      dropdownOpen.value = false;
    };
    
    const toggleNavbar = () => {
      navbarOpen.value = !navbarOpen.value;
    };
    
    const logout = () => {
      closeDropdown();
      store.dispatch('auth/logout');
    };
    
    const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({
        path: '/search',
        query: { 
          q: searchQuery.value.trim(),
          tab: 'users'
        }
      });
      searchQuery.value = '';
    }
  };
    
    return {
      searchQuery,
      isAuthenticated,
      currentUser,
      dropdownOpen,
      navbarOpen,
      toggleDropdown,
      closeDropdown,
      toggleNavbar,
      logout,
      handleSearch
    };
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    },
  },
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.custom-dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1000;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
}

.dropdown-menu.show {
  display: block;
}

@media (max-width: 991px) {
  .d-flex {
    flex-direction: column;
    width: 100%;
  }
  
  form.d-flex {
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .custom-dropdown {
    width: 100%;
  }
  
  .dropdown-menu {
    width: 100%;
    position: static;
    margin-top: 0.5rem;
  }
}
</style>