import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
// Import views directly with relative paths to ensure they're found
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Profile from '../views/Profile.vue';
import PostDetail from '../views/PostDetail.vue';
import CreatePost from '../views/CreatePost.vue';
import EditPost from '../views/EditPost.vue';
import NotFound from '../views/NotFound.vue';
// Import new reel-related views
import Reels from '../views/Reels.vue';
import ReelDetailView from '../views/ReelDetailView.vue';
import CreateReelView from '../views/CreateReelView.vue';
import EditReelView from '../views/EditReelView.vue';

// Define routes with base path adjusted
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: PostDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-post',
    name: 'CreatePost',
    component: CreatePost,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-post/:id',
    name: 'EditPost',
    component: EditPost,
    meta: { requiresAuth: true }
  },
  // New reel-related routes
  {
    path: '/reels',
    name: 'Reels',
    component: Reels,
    meta: { requiresAuth: true }
  },
  {
    path: '/reels/:id',
    name: 'ReelDetail',
    component: ReelDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-reel',
    name: 'CreateReel',
    component: CreateReelView,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-reel/:id',
    name: 'EditReel',
    component: EditReelView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

// Create router instance with specific base for GitHub Pages
const router = createRouter({
  history: createWebHistory('/social_media_platform-frontend/'),
  routes
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
 
  // Handle routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ 
        name: 'Login', 
        query: { 
          redirect: to.fullPath.replace('/social_media_platform-frontend', '')
        } 
      });
    } else {
      next();
    }
  }
 
  // Handle routes for guests only (like login page)
  else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isAuthenticated) {
      next({ name: 'Home' });
    } else {
      next();
    }
  }
 
  // For all other routes
  else {
    next();
  }
});

export default router;