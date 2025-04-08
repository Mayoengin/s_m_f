// src/views/Profile.vue (continued)
<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import PostCard from '@/components/post/PostCard.vue';

export default {
  name: 'UserProfile',
  components: {
    PostCard
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    
    // State
    const username = ref(route.params.username);
    const loading = ref(true);
    const loadingPosts = ref(true);
    const loadingFollowers = ref(true);
    const loadingFollowing = ref(true);
    const followActionInProgress = ref(false);
    const userPosts = ref([]);
    
    // Computed values
    const currentUser = computed(() => store.getters['auth/currentUser'] || {});
    const allUsers = computed(() => store.getters['users/allUsers']);
    const allPosts = computed(() => store.getters['posts/allPosts']);
    
    // Find the profile based on the username
    const profile = computed(() => {
      return allUsers.value.find(user => user.username === username.value);
    });
    
    const userInitial = computed(() => {
      return profile.value?.username?.charAt(0).toUpperCase() || '';
    });
    
    const isCurrentUser = computed(() => {
      return currentUser.value.id === profile.value?.id;
    });
    
    const followers = computed(() => store.getters['users/followers'] || []);
    const following = computed(() => store.getters['users/following'] || []);
    
    const followersCount = computed(() => followers.value.length);
    const followingCount = computed(() => following.value.length);
    
    const isFollowing = computed(() => {
      if (!profile.value) return false;
      return following.value.some(user => user.id === profile.value.id);
    });
    
    const formattedJoinDate = computed(() => {
      if (!profile.value?.created_at) return '';
      
      const date = new Date(profile.value.created_at);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    });
    
    // Methods
    const fetchUserProfile = async () => {
      loading.value = true;
      try {
        // First, fetch all users if not already loaded
        if (allUsers.value.length === 0) {
          await store.dispatch('users/fetchUsers');
        }
        
        // If we can't find the user by username, try to fetch directly
        if (!profile.value) {
          try {
            await store.dispatch('users/fetchUserByUsername', username.value);
          } catch (error) {
            console.error('User not found:', error);
          }
        }
      } finally {
        loading.value = false;
      }
    };
    
    const fetchUserPosts = async () => {
      loadingPosts.value = true;
      try {
        // First, fetch all posts
        await store.dispatch('posts/fetchPosts', { limit: 100, skip: 0, search: '' });
        
        // Filter posts by user ID
        if (profile.value) {
          userPosts.value = allPosts.value.filter(post => post.owner_id === profile.value.id);
        }
      } finally {
        loadingPosts.value = false;
      }
    };
    
    const fetchFollowData = async () => {
      if (isCurrentUser.value) {
        // For the current user, we fetch their followers and who they follow
        loadingFollowers.value = true;
        loadingFollowing.value = true;
        
        try {
          await store.dispatch('users/fetchFollowers');
          await store.dispatch('users/fetchFollowing');
        } finally {
          loadingFollowers.value = false;
          loadingFollowing.value = false;
        }
      } else {
        // For other users, we just need to know if current user is following them
        // This is simplified, in a real app you might have endpoints to get followers/following of any user
        await store.dispatch('users/fetchFollowing');
      }
    };
    
    const followUser = async () => {
      if (!profile.value) return;
      
      followActionInProgress.value = true;
      try {
        await store.dispatch('users/followUser', profile.value.id);
      } finally {
        followActionInProgress.value = false;
      }
    };
    
    const unfollowUser = async () => {
      if (!profile.value) return;
      
      followActionInProgress.value = true;
      try {
        await store.dispatch('users/unfollowUser', profile.value.id);
      } finally {
        followActionInProgress.value = false;
      }
    };
    
    const handleVote = async (postId) => {
      await store.dispatch('posts/votePost', postId);
    };
    
    const getUserInitial = (username) => {
      return username?.charAt(0).toUpperCase() || '';
    };
    
    // Watch for changes in the route parameter
    watch(() => route.params.username, (newUsername) => {
      username.value = newUsername;
      fetchUserProfile();
      fetchUserPosts();
      fetchFollowData();
    });
    
    // Initial data fetching
    onMounted(async () => {
      await fetchUserProfile();
      await fetchUserPosts();
      await fetchFollowData();
    });
    
    return {
      profile,
      loading,
      loadingPosts,
      loadingFollowers,
      loadingFollowing,
      userPosts,
      userInitial,
      isCurrentUser,
      followers,
      following,
      followersCount,
      followingCount,
      isFollowing,
      formattedJoinDate,
      followUser,
      unfollowUser,
      followActionInProgress,
      handleVote,
      getUserInitial
    };
  }
};
</script>

<style scoped>
.profile-avatar {
  width: 100px;
  height: 100px;
  font-size: 42px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>