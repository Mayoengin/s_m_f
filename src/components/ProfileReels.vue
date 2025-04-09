<template>
    <div class="profile-reels">
      <h3 class="mb-4">{{ title }}</h3>
      
      <div v-if="loading" class="text-center my-4">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p>Loading reels...</p>
      </div>
      
      <div v-else-if="reels.length === 0" class="text-center my-4">
        <div class="alert alert-info">
          <i class="fas fa-film me-2"></i>
          {{ noReelsMessage }}
          <div v-if="isCurrentUser" class="mt-2">
            <router-link to="/create-reel" class="btn btn-primary btn-sm">
              <i class="fas fa-plus me-2"></i> Create your first reel
            </router-link>
          </div>
        </div>
      </div>
      
      <div v-else class="row g-4">
        <div v-for="reel in reels" :key="reel.id" class="col-md-4">
          <div class="card reel-card h-100">
            <!-- Video thumbnail -->
            <div class="reel-preview" @click="viewReel(reel.id)">
              <video class="card-img-top" :src="reel.video_url" preload="metadata"></video>
              <div class="overlay">
                <i class="fas fa-play-circle fa-3x"></i>
              </div>
            </div>
            
            <div class="card-body">
              <h5 class="card-title">{{ reel.title }}</h5>
              <p class="card-text small text-muted">{{ formatDate(reel.created_at) }}</p>
              <p class="card-text">{{ truncateText(reel.description, 60) }}</p>
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
                <div v-if="isCurrentUser">
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
  import { computed, onMounted, ref } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { Modal } from 'bootstrap';
  
  export default {
    name: 'ProfileReels',
    props: {
      userId: {
        type: Number,
        required: true
      },
      isCurrentUser: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: 'Reels'
      },
      noReelsMessage: {
        type: String,
        default: 'No reels found.'
      }
    },
    
    setup(props) {
      const store = useStore();
      const router = useRouter();
      const loading = ref(true);
      const deleteModal = ref(null);
      const reelToDelete = ref(null);
      
      const reels = computed(() => store.getters['reels/allReels']);
      
      const fetchReels = async () => {
        loading.value = true;
        
        try {
          await store.dispatch('reels/fetchReels', {
            userId: props.userId
          });
        } catch (error) {
          console.error('Failed to load reels:', error);
        } finally {
          loading.value = false;
        }
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
        
        const success = await store.dispatch('reels/deleteReel', reelToDelete.value.id);
        if (success) {
          deleteModal.value.hide();
          // Refresh the reels list
          fetchReels();
        }
      };
      
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }).format(date);
      };
      
      const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      };
      
      onMounted(() => {
        fetchReels();
      });
      
      return {
        reels,
        loading,
        viewReel,
        deleteReelConfirm,
        confirmDelete,
        formatDate,
        truncateText
      };
    }
  };
  </script>
  
  <style scoped>
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
    height: 180px;
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