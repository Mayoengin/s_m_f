<template>
  <div class="reels-container">
    <div v-if="loading" class="text-center my-4">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p>Loading reels...</p>
    </div>
    
    <div v-else-if="reels.length === 0" class="text-center my-4">
      <div class="alert alert-info">
        <i class="fas fa-film me-2"></i>
        No reels found.
        <div class="mt-2">
          <router-link to="/create-reel" class="btn btn-primary btn-sm">
            <i class="fas fa-plus me-2"></i> Create your first reel
          </router-link>
        </div>
      </div>
    </div>
    
    <div v-else class="row g-4">
      <div v-for="reel in reels" :key="reel.id" class="col-md-6 col-lg-4">
        <div class="card reel-card h-100">
          <!-- Video thumbnail or preview -->
          <div class="reel-preview" @click="viewReel(reel.id)">
            <!-- Use poster attribute for thumbnail and preload="metadata" -->
            <video 
              class="card-img-top" 
              :src="reel.video_url" 
              preload="metadata"
              muted
              ref="videoElement"
              @error="handleVideoError($event, reel)"
            ></video>
            <div class="overlay">
              <i class="fas fa-play-circle fa-3x"></i>
            </div>
          </div>
          
          <div class="card-body">
            <h5 class="card-title">{{ reel.title }}</h5>
            <p class="card-text small text-muted">
              By <router-link :to="`/profile/${reel.owner.username}`">
                {{ reel.owner.username }}
              </router-link>
              · {{ formatDate(reel.created_at) }}
            </p>
            <p class="card-text">{{ truncateText(reel.description, 80) }}</p>
          </div>
          
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="me-3">
                  <i class="fas fa-heart" :class="{'text-danger': reel.is_liked}"></i>
                  {{ reel.likes || 0 }}
                </span>
                <span>
                  <i class="fas fa-comment"></i>
                  {{ reel.comments_count || 0 }}
                </span>
              </div>
              <div v-if="currentUser && currentUser.id === reel.owner_id">
                <router-link :to="`/edit-reel/${reel.id}`" class="btn btn-sm btn-outline-secondary me-2">
                  <i class="fas fa-edit"></i>
                </router-link>
                <button class="btn btn-sm btn-outline-danger" @click="deleteReelConfirm(reel)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Load more button -->
    <div v-if="reels.length > 0 && !reachedEnd" class="text-center mt-4">
      <button class="btn btn-outline-primary" @click="loadMore" :disabled="loading">
        <i class="fas fa-sync me-2" :class="{'fa-spin': loading}"></i>
        Load more reels
      </button>
    </div>
    
    <!-- Confirmation Modal -->
    <div class="modal fade" id="deleteReelModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Reel</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this reel? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';

export default {
  name: 'ReelsFeed',
  props: {
    userId: {
      type: Number,
      default: null
    }
  },
  
  setup(props) {
    const store = useStore();
    const router = useRouter();
    const loading = ref(false);
    const skip = ref(0);
    const limit = ref(9);
    const reachedEnd = ref(false);
    const deleteModal = ref(null);
    const reelToDelete = ref(null);
    const videoElement = ref([]);
    
    const reels = computed(() => store.getters['reels/allReels']);
    const currentUser = computed(() => store.getters['auth/currentUser']);
    
    const fetchReels = async (loadMore = false) => {
      if (loading.value) return;
      
      loading.value = true;
      if (!loadMore) {
        skip.value = 0;
        reachedEnd.value = false;
      }
      
      try {
        console.log(`Fetching reels with params: limit=${limit.value}, skip=${skip.value}, userId=${props.userId}`);
        
        const response = await store.dispatch('reels/fetchReels', {
          limit: limit.value,
          skip: skip.value,
          userId: props.userId
        });
        
        console.log(`Fetched ${response.length} reels`);
        
        if (response.length < limit.value) {
          reachedEnd.value = true;
        }
        
        if (loadMore) {
          skip.value += limit.value;
        }
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const loadMore = () => {
      fetchReels(true);
    };
    
    const viewReel = (reelId) => {
      router.push(`/reels/${reelId}`);
    };
    
    const deleteReelConfirm = (reel) => {
      reelToDelete.value = reel;
      if (!deleteModal.value) {
        deleteModal.value = new Modal(document.getElementById('deleteReelModal'));
      }
      deleteModal.value.show();
    };
    
    const confirmDelete = async () => {
      if (!reelToDelete.value) return;
      
      try {
        const success = await store.dispatch('reels/deleteReel', reelToDelete.value.id);
        if (success) {
          if (deleteModal.value) {
            deleteModal.value.hide();
          }
          // Refresh the reels list
          fetchReels();
        }
      } catch (error) {
        console.error('Error deleting reel:', error);
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown date';
      
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      } catch (e) {
        console.error('Error formatting date:', e);
        return 'Invalid date';
      }
    };
    
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    
    const handleVideoError = (event, reel) => {
      console.error(`Error loading video for reel ${reel.id}:`, event);
      // Mark the video element with an error class for styling
      if (event.target) {
        event.target.classList.add('video-error');
        // Add a fallback background so it's not just empty
        event.target.style.backgroundColor = '#000';
      }
    };
    
    onMounted(() => {
      fetchReels();
    });
    
    // Watch for changes in userId prop to refetch reels
    watch(() => props.userId, () => {
      fetchReels();
    });
    
    return {
      reels,
      loading,
      reachedEnd,
      currentUser,
      deleteModal,
      reelToDelete,
      videoElement,
      loadMore,
      viewReel,
      deleteReelConfirm,
      confirmDelete,
      formatDate,
      truncateText,
      handleVideoError
      };
    }
  };
  </script>
  
  <style scoped>
  .reels-container {
    padding: 20px 0;
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
    position: relative;
    cursor: pointer;
    height: 200px;
    overflow: hidden;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .reel-preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .reel-preview .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .reel-preview:hover .overlay {
    opacity: 1;
  }
  
  .overlay i {
    color: white;
  }
  </style>