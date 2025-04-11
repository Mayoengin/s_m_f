  // src/views/Home.vue
  <template>
    <div class="home-container">
      <div class="row">
        <!-- Left sidebar - User profile summary and navigation -->
        <div class="col-lg-3 d-none d-lg-block">
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex flex-column align-items-center text-center mb-3">
                <UserAvatar 
                  :username="currentUser.username" 
                  :profilePicture="currentUser.profile_picture" 
                  size="lg" 
                  class="mb-2"
                />
                <h5 class="mb-0">{{ currentUser.username }}</h5>
                <p class="text-muted mb-1">{{ currentUser.email }}</p>
              </div>
              <div class="d-flex justify-content-around mb-2">
                <div class="text-center">
                  <h6>{{ followingCount }}</h6>
                  <small class="text-muted">Following</small>
                </div>
                <div class="text-center">
                  <h6>{{ followersCount }}</h6>
                  <small class="text-muted">Followers</small>
                </div>
              </div>
              <div class="d-grid">
                <router-link :to="`/profile/${currentUser.username}`" class="btn btn-outline-primary">
                  View Profile
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Quick Links</h5>
              <div class="list-group list-group-flush">
                <router-link to="/" class="list-group-item list-group-item-action">
                  <i class="fas fa-home me-2"></i> Home
                </router-link>
                <router-link to="/create-post" class="list-group-item list-group-item-action">
                  <i class="fas fa-edit me-2"></i> Create Post
                </router-link>
                <a href="#" @click.prevent="refreshPosts" class="list-group-item list-group-item-action">
                  <i class="fas fa-sync-alt me-2"></i> Refresh Feed
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main content - Posts feed -->
        <div class="col-lg-6 col-md-8">
          <!-- Create post shortcut -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                  <UserAvatar 
                    :username="currentUser.username" 
                    :profilePicture="currentUser.profile_picture" 
                    size="sm" 
                    class="me-2"
                  />

                <router-link 
                  to="/create-post" 
                  class="form-control text-start text-muted"
                >
                  What's on your mind, {{ currentUser.username }}?
                </router-link>
              </div>
              <div class="d-flex justify-content-around">
                <router-link to="/create-post" class="btn btn-outline-primary flex-grow-1 mx-1">
                  <i class="fas fa-edit me-1"></i> Create Post
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Posts feed -->
          <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading posts...</p>
          </div>
          
          <div v-else-if="posts.length === 0" class="card">
            <div class="card-body text-center py-5">
              <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No posts yet</h5>
              <p class="text-muted">Start by creating a post or following users.</p>
              <router-link to="/create-post" class="btn btn-primary">
                <i class="fas fa-edit me-1"></i> Create Post
              </router-link>
            </div>
          </div>
          
          <div v-else>
            <post-card 
              v-for="post in posts" 
              :key="post.id" 
              :post="post"
              @vote="handleVote"
            />
          </div>
          
          <!-- Load more posts button -->
          <div v-if="posts.length > 0" class="text-center my-4">
            <button 
              class="btn btn-outline-primary" 
              @click="loadMorePosts"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Load More Posts
            </button>
          </div>
        </div>
        
        <!-- Right sidebar - Suggestions and trending -->
    <div class="col-lg-3 col-md-4 d-none d-md-block">
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">People to Follow</h5>
              <div v-if="loadingUsers" class="text-center my-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="suggestedUsers.length === 0" class="text-muted text-center">
                <p>No suggestions available</p>
              </div>
              <div v-else>
                <div v-for="user in suggestedUsers" :key="user.id" class="d-flex align-items-center mb-3">
                  <UserAvatar 
                    :username="user.username" 
                    :profilePicture="user.profile_picture" 
                    size="sm"
                    backgroundColor="bg-secondary"
                    class="me-2"
                  />
                  <div class="flex-grow-1">
                    <router-link :to="`/profile/${user.username}`" class="text-decoration-none">
                      <strong>{{ user.username }}</strong>
                    </router-link>
                  </div>
                  <button 
                    class="btn btn-sm btn-primary follow-btn" 
                    @click="followUser(user.id)"
                    :disabled="followingInProgress.includes(user.id)"
                  >
                    <span v-if="followingInProgress.includes(user.id)" class="spinner-border spinner-border-sm"></span>
                    <span v-else>Follow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>   
          <!-- Trending or latest posts section could go here -->
  </template>

  <script>
  import { computed, onMounted, ref } from 'vue';
  import { useStore } from 'vuex';
  import PostCard from '@/components/post/PostCard.vue';
  import UserAvatar from '@/components/common/UserAvatar.vue';
  export default {
    name: 'HomePage',
    components: {
      PostCard,
      UserAvatar
    },
    setup() {
      const store = useStore();
      const postsLimit = ref(10);
      const postsSkip = ref(0);
      const searchQuery = ref('');
      const followingInProgress = ref([]);
      
      const currentUser = computed(() => store.getters['auth/currentUser'] || {});
      const posts = computed(() => store.getters['posts/allPosts']);
      const loading = computed(() => store.state.posts.loading);
      const loadingUsers = computed(() => store.state.users.loading);
      
      const allUsers = computed(() => store.getters['users/allUsers']);
      const following = computed(() => store.getters['users/following'] || []);
      
      const followingCount = computed(() => following.value.length);
      const followersCount = computed(() => store.getters['users/followers']?.length || 0);
      
      // Filter out users already being followed and current user
      const suggestedUsers = computed(() => {
        const followingIds = following.value.map(user => user.id);
        return allUsers.value
          .filter(user => 
            user.id !== currentUser.value.id && 
            !followingIds.includes(user.id)
          )
          .slice(0, 5); // Limit to 5 suggestions
      });
      
      const loadPosts = async () => {
        await store.dispatch('posts/fetchPosts', {
          limit: postsLimit.value,
          skip: postsSkip.value,
          search: searchQuery.value
        });
      };
      
      const loadMorePosts = async () => {
        postsSkip.value += postsLimit.value;
        await loadPosts();
      };
      
      const refreshPosts = async () => {
        postsSkip.value = 0;
        await loadPosts();
      };
      
      const handleVote = async (postId) => {
        await store.dispatch('posts/votePost', postId);
      };
      
      const followUser = async (userId) => {
        followingInProgress.value.push(userId);
        try {
          await store.dispatch('users/followUser', userId);
          // Refresh user lists
          store.dispatch('users/fetchUsers');
          store.dispatch('users/fetchFollowing');
        } finally {
          followingInProgress.value = followingInProgress.value.filter(id => id !== userId);
        }
      };
      
      onMounted(async () => {
        // Load initial posts
        await loadPosts();
        
        // Load users for suggestions
        await store.dispatch('users/fetchUsers');
        
        // Load following/followers for the current user
        await store.dispatch('users/fetchFollowing');
        await store.dispatch('users/fetchFollowers');
      });
      
      return {
        currentUser,
        posts,
        loading,
        loadingUsers,
        loadMorePosts,
        refreshPosts,
        handleVote,
        suggestedUsers,
        followingCount,
        followersCount,
        followUser,
        followingInProgress
      };
    }
  };
  </script>

  <style scoped>
  /* Reset and base styles */
  .home-container {
    padding: 1rem 0;
  }

  .card {
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-title {
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
  }

  /* User avatar styles */
  .user-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .user-avatar:hover {
    transform: scale(1.05);
  }

  .user-avatar-sm {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .user-avatar-lg {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  /* Button styles */
  .btn {
    border-radius: 0.375rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background-color: #0d6efd;
  }

  .btn-primary:hover {
    background-color: #0b5ed7;
    transform: translateY(-1px);
  }

  .btn-outline-primary {
    color: #0d6efd;
    border-color: #0d6efd;
  }

  .btn-outline-primary:hover {
    background-color: #0d6efd;
    color: white;
    transform: translateY(-1px);
  }

  .follow-btn {
    min-width: 70px;
  }

  /* List group styles */
  .list-group-item {
    border-left: none;
    border-right: none;
    transition: background-color 0.2s ease;
  }

  .list-group-item:first-child {
    border-top: none;
  }

  .list-group-item:hover {
    background-color: rgba(13, 110, 253, 0.05);
  }

  /* Responsive adjustments */
  @media (max-width: 991.98px) {
    .home-container {
      padding: 0.5rem;
    }
  }
  </style>