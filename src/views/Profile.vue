// src/views/Profile.vue
<template>
  <div class="profile-container">
    <!-- Profile Header -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading profile...</p>
    </div>

    <div v-else-if="!profile" class="alert alert-warning">
      User not found.
    </div>


    <div v-else class="profile-content">
      <!-- Profile Header with Dynamic Background -->
      <div class="profile-header bg-white shadow-sm rounded-3 mb-4">
        <div 
          class="cover-photo position-relative" 
          :style="backgroundImageStyle"
        >
          <div class="profile-avatar-container">
            <div 
              class="profile-avatar text-white rounded-circle"
              :class="{'bg-primary': !profile.profile_picture}"
              :style="profilePictureStyle"
            >
              <span v-if="!profile.profile_picture">{{ userInitial }}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-info text-center mt-5 pb-3">
          <h2 class="mb-1">{{ profile.username }}</h2>
          <p class="text-muted mb-2">
            <i class="fas fa-envelope me-2"></i>{{ profile.email }}
          </p>
          <p class="text-muted">
            <i class="fas fa-calendar-alt me-2"></i>Joined {{ formattedJoinDate }}
          </p>
          
          <!-- Follow/Edit Profile Button -->
          <div class="profile-actions mt-3">
            <button 
              v-if="!isCurrentUser" 
              class="btn me-2"
              :class="{'btn-primary': !isFollowing, 'btn-outline-primary': isFollowing}"
              @click="isFollowing ? unfollowUser() : followUser()"
              :disabled="followActionInProgress"
            >
              <span v-if="followActionInProgress" class="spinner-border spinner-border-sm me-2"></span>
              {{ isFollowing ? 'Unfollow' : 'Follow' }}
            </button>
            <router-link 
              v-if="isCurrentUser" 
              to="/edit-profile" 
              class="btn btn-outline-secondary"
            >
              <i class="fas fa-edit me-2"></i>Edit Profile
            </router-link>
          </div>
        </div>
        
        <!-- User Stats -->
        <div class="profile-stats border-top py-3">
          <div class="row text-center">
            <div class="col">
              <h4 class="mb-0">{{ userPosts.length }}</h4>
              <small class="text-muted">Posts</small>
            </div>
            <div class="col">
              <h4 class="mb-0">{{ followersCount }}</h4>
              <small class="text-muted">Followers</small>
            </div>
            <div class="col">
              <h4 class="mb-0">{{ followingCount }}</h4>
              <small class="text-muted">Following</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Tabs -->
      <ul class="nav nav-tabs mb-4" id="profileTabs">
        <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#posts">
            <i class="fas fa-th me-2"></i>Posts
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#reels">
            <i class="fas fa-film me-2"></i>Reels
          </a>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Posts Tab -->
        <div class="tab-pane fade show active" id="posts">
          <div v-if="loadingPosts" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading posts...</span>
            </div>
          </div>
          <div v-else-if="userPosts.length === 0" class="alert alert-info text-center">
            <i class="fas fa-inbox fa-3x mb-3"></i>
            <p>No posts yet</p>
            <router-link 
              v-if="isCurrentUser" 
              to="/create-post" 
              class="btn btn-primary"
            >
              Create First Post
            </router-link>
          </div>
          <div v-else>
            <PostCard 
              v-for="post in userPosts" 
              :key="post.id" 
              :post="post"
              @vote="handleVote"
            />
          </div>
        </div>
        
        <!-- Reels Tab -->
        <div class="tab-pane fade" id="reels">
          <div v-if="loadingReels" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading reels...</span>
            </div>
          </div>
          <div v-else-if="userReels.length === 0" class="alert alert-info text-center">
            <i class="fas fa-film fa-3x mb-3"></i>
            <p>No reels yet</p>
            <router-link 
              v-if="isCurrentUser" 
              to="/create-reel" 
              class="btn btn-primary"
            >
              Create First Reel
            </router-link>
          </div>
          <div v-else class="row g-4">
            <div 
              v-for="reel in userReels" 
              :key="reel.id" 
              class="col-md-4 mb-4"
            >
              <div class="card reel-card h-100 overflow-hidden">
                <div class="reel-preview position-relative">
                  <video 
                    class="card-img-top" 
                    :src="reel.video_url" 
                    preload="metadata"
                  ></video>
                  <div class="reel-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <router-link 
                      :to="`/reels/${reel.id}`" 
                      class="btn btn-light btn-play"
                    >
                      <i class="fas fa-play"></i>
                    </router-link>
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ reel.title }}</h5>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      <i class="fas fa-heart me-1"></i>{{ reel.likes || 0 }}
                    </small>
                    <small class="text-muted">
                      <i class="fas fa-comment me-1"></i>{{ reel.comments_count || 0 }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
    const loadingReels = ref(true);
    const followActionInProgress = ref(false);
    const userPosts = ref([]);
    const userReels = ref([]);
    
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
    
    // Profile picture style with background image if available
    const profilePictureStyle = computed(() => {
      if (profile.value?.profile_picture) {
        // Debug output to check the actual path being used
        console.log('Raw profile picture URL:', profile.value.profile_picture);
        
        // Ensure the URL doesn't have an extra leading slash
        let imageUrl = profile.value.profile_picture;
        if (imageUrl.startsWith('/http')) {
          // Remove the leading slash if it exists before http
          imageUrl = imageUrl.substring(1);
          console.log('Fixed URL:', imageUrl);
        }
        
        return {
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
      return {};
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
    const backgroundImageStyle = computed(() => {
      if (profile.value?.background_image) {
        return {
          backgroundImage: `url(${profile.value.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '200px',
          position: 'relative'
        };
      }
      return {
        background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
        height: '200px',
        position: 'relative'
      };
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
    
    const fetchUserReels = async () => {
      loadingReels.value = true;
      try {
        if (profile.value) {
          const response = await store.dispatch('reels/fetchReels', {
            userId: profile.value.id,
            limit: 100,
            skip: 0
          });
          userReels.value = response;
        }
      } catch (error) {
        console.error('Failed to fetch user reels:', error);
      } finally {
        loadingReels.value = false;
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
    
    // Watch for changes in the route parameter
    watch(() => route.params.username, (newUsername) => {
      username.value = newUsername;
      fetchUserProfile();
      fetchUserPosts();
      fetchUserReels();
      fetchFollowData();
    });
    
    // Initial data fetching
    onMounted(async () => {
      await fetchUserProfile();
      await fetchUserPosts();
      await fetchUserReels();
      await fetchFollowData();
    });
    
    return {
      profile,
      loading,
      loadingPosts,
      loadingFollowers,
      loadingFollowing,
      loadingReels,
      userPosts,
      userReels,
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
      profilePictureStyle,
      backgroundImageStyle
    };
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  font-size: 48px;
  border: 4px solid white;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.profile-avatar-container {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.cover-photo {
  height: 200px;
  background: linear-gradient(135deg, #0d6efd 0%, #6610f2 100%);
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-stats {
  background-color: #f8f9fa;
}

.nav-tabs .nav-link {
  color: #495057;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  border-color: #dee2e6 #dee2e6 #fff;
  border-bottom: 2px solid #0d6efd;
}

.reel-card {
  transition: transform 0.2s;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.reel-card:hover {
  transform: translateY(-5px);
}

.reel-preview {
  height: 200px;
  overflow: hidden;
  background-color: #000;
}

.reel-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-overlay {
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.reel-card:hover .reel-overlay {
  opacity: 1;
}

.btn-play {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-play i {
  font-size: 20px;
}
.cover-photo {
  position: relative;
  background-size: cover;
  background-position: center;
}

</style>