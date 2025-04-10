<template>
  <div class="reel-detail-container">
    <div v-if="loading" class="text-center my-5">
      <i class="fas fa-spinner fa-spin fa-3x"></i>
      <p class="mt-3">Loading reel...</p>
    </div>
    
    <div v-else-if="!reel" class="alert alert-danger">
      Reel not found or has been deleted.
    </div>
    
    <div v-else class="reel-content">
      <div class="row">
        <!-- Video section -->
        <div class="col-md-8">
          <div class="video-player-container">
            <video 
              controls 
              autoplay 
              class="video-player" 
              ref="videoPlayer"
              @error="handleVideoError"
            >
              <source :src="reel.video_url" :type="getVideoType(reel.video_url)">
              Your browser does not support the video tag.
            </video>
            
            <!-- Error message that shows if video fails to load -->
            <div v-if="videoError" class="video-error-message">
              <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
              <p>Unable to play this video. It may be unavailable or in an unsupported format.</p>
              <p v-if="isOwner" class="mt-2">
                <router-link :to="`/edit-reel/${reel.id}`" class="btn btn-sm btn-primary">
                  <i class="fas fa-edit me-1"></i> Edit this reel
                </router-link>
              </p>
            </div>
          </div>
          
          <!-- Reel information -->
          <div class="reel-info mt-3">
            <h2>{{ reel.title }}</h2>
            
            <div class="d-flex align-items-center my-3">
              <router-link :to="`/profile/${reel.owner.username}`" class="d-flex align-items-center text-decoration-none">
                <span class="avatar">{{ getUserInitial(reel.owner.username) }}</span>
                <span class="ms-2 fw-bold">{{ reel.owner.username }}</span>
              </router-link>
              
              <span class="mx-3">•</span>
              <span class="text-muted">{{ formatDate(reel.created_at) }}</span>
              
              <!-- Actions dropdown for owner -->
              <div v-if="isOwner" class="ms-auto">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary" type="button" id="reelActionsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="reelActionsDropdown">
                    <li>
                      <router-link :to="`/edit-reel/${reel.id}`" class="dropdown-item">
                        <i class="fas fa-edit me-2"></i> Edit
                      </router-link>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="confirmDelete">
                        <i class="fas fa-trash me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="reel-actions d-flex align-items-center my-3">
              <button 
                class="btn btn-like me-3" 
                :class="{'liked': reel.is_liked}" 
                @click="handleLike"
              >
                <i class="fas fa-heart"></i>
                <span class="ms-1">{{ reel.likes || 0 }}</span>
              </button>
              
              <button class="btn btn-comment" @click="focusCommentInput">
                <i class="fas fa-comment"></i>
                <span class="ms-1">{{ comments.length || 0 }}</span>
              </button>
            </div>
            
            <div class="reel-description">
              <p>{{ reel.description }}</p>
            </div>
            
            <!-- Video details (only for the owner) -->
            <div v-if="isOwner" class="video-details mt-3 p-3 bg-light rounded">
              <h6><i class="fas fa-info-circle me-2"></i> Video Details</h6>
              
              <div v-if="reel.video_url" class="small text-muted mt-2">
                <div><strong>URL:</strong> {{ reel.video_url }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Comments section -->
        <div class="col-md-4">
          <div class="comments-container">
            <h4 class="mb-3">Comments</h4>
            
            <div v-if="commentsLoading" class="text-center my-3">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Loading comments...</p>
            </div>
            
            <div v-else-if="comments.length === 0" class="text-center my-3">
              <p class="text-muted">No comments yet.</p>
              <p>Be the first to comment!</p>
            </div>
            
            <div v-else class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <div class="d-flex">
                  <div class="comment-avatar">
                    {{ getUserInitial(comment.user.username) }}
                  </div>
                  <div class="comment-content ms-2">
                    <div class="comment-header">
                      <router-link :to="`/profile/${comment.user.username}`" class="fw-bold text-decoration-none">
                        {{ comment.user.username }}
                      </router-link>
                      <small class="text-muted ms-2">{{ formatDate(comment.created_at) }}</small>
                    </div>
                    <div class="comment-text">
                      {{ comment.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Comment form -->
            <div class="comment-form mt-3">
              <form @submit.prevent="submitComment">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Add a comment..." 
                    v-model="commentText"
                    ref="commentInput"
                    :disabled="!isAuthenticated"
                  >
                  <button 
                    class="btn btn-primary" 
                    type="submit" 
                    :disabled="!commentText.trim() || !isAuthenticated"
                  >
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
                <div v-if="!isAuthenticated" class="form-text text-center mt-2">
                  <router-link to="/login">Log in</router-link> to leave a comment.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
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
            <button type="button" class="btn btn-danger" @click="deleteReel">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { Modal } from 'bootstrap';

export default {
  name: 'ReelDetail',
  
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    
    const videoPlayer = ref(null);
    const commentInput = ref(null);
    const deleteModal = ref(null);
    
    const loading = ref(true);
    const commentsLoading = ref(false);
    const commentText = ref('');
    const videoError = ref(false);
    
    const reel = computed(() => store.getters['reels/getCurrentReel']);
    const comments = computed(() => store.getters['reels/getReelComments'](Number(route.params.id)));
    const currentUser = computed(() => store.getters['auth/currentUser']);
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    
    const isOwner = computed(() => {
      if (!reel.value || !currentUser.value) return false;
      return reel.value.owner_id === currentUser.value.id;
    });
    
    const reelId = computed(() => Number(route.params.id));
    
    const loadReelData = async () => {
      loading.value = true;
      videoError.value = false;
      
      try {
        await store.dispatch('reels/fetchReelById', reelId.value);
        await fetchComments();
      } catch (error) {
        console.error('Failed to load reel:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchComments = async () => {
      commentsLoading.value = true;
      
      try {
        await store.dispatch('reels/fetchReelComments', reelId.value);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        commentsLoading.value = false;
      }
    };
    
    const handleLike = async () => {
      if (!isAuthenticated.value) {
        router.push('/login');
        return;
      }
      
      await store.dispatch('reels/likeReel', reelId.value);
    };
    
    const submitComment = async () => {
      if (!commentText.value.trim() || !isAuthenticated.value) return;
      
      try {
        await store.dispatch('reels/commentOnReel', {
          reelId: reelId.value,
          content: commentText.value.trim()
        });
        
        commentText.value = '';
      } catch (error) {
        console.error('Failed to post comment:', error);
      }
    };
    
    const focusCommentInput = () => {
      if (commentInput.value) {
        commentInput.value.focus();
      }
    };
    
    const confirmDelete = () => {
      if (!deleteModal.value) {
        deleteModal.value = new Modal(document.getElementById('deleteReelModal'));
      }
      deleteModal.value.show();
    };
    
    const deleteReel = async () => {
      try {
        const success = await store.dispatch('reels/deleteReel', reelId.value);
        if (success) {
          if (deleteModal.value) {
            deleteModal.value.hide();
          }
          router.push('/reels');
        }
      } catch (error) {
        console.error('Failed to delete reel:', error);
      }
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown date';
      
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        console.error('Error formatting date:', e);
        return 'Invalid date';
      }
    };
    
    const getUserInitial = (username) => {
      return username ? username.charAt(0).toUpperCase() : '?';
    };
    
    const getVideoType = (url) => {
      if (!url) return 'video/mp4';
      
      const extension = url.split('.').pop().toLowerCase();
      switch (extension) {
        case 'mp4':
          return 'video/mp4';
        case 'webm':
          return 'video/webm';
        case 'mov':
          return 'video/quicktime';
        case 'ogg':
          return 'video/ogg';
        default:
          return 'video/mp4';
      }
    };
    
    const handleVideoError = (event) => {
      console.error('Video error:', event);
      videoError.value = true;
    };
    
    // Watch for route changes
    watch(() => route.params.id, (newId) => {
      if (newId && Number(newId) !== reelId.value) {
        videoError.value = false;
        loadReelData();
      }
    });
    
    onMounted(() => {
      loadReelData();
    });
    
    onUnmounted(() => {
      if (videoPlayer.value) {
        videoPlayer.value.pause();
      }
    });
    
    return {
      reel,
      loading,
      commentsLoading,
      comments,
      commentText,
      videoPlayer,
      commentInput,
      isAuthenticated,
      isOwner,
      videoError,
      loadReelData,
      handleLike,
      submitComment,
      focusCommentInput,
      confirmDelete,
      deleteReel,
      formatDate,
      getUserInitial,
      getVideoType,
      handleVideoError
    };
  }
};
</script>

<style scoped>
.reel-detail-container {
  padding: 20px 0;
}

.video-player-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
}

.video-player {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.video-error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 2rem;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.btn-like, .btn-comment {
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.btn-like:hover, .btn-comment:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-like.liked {
  color: #e74c3c;
}

.comments-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #eee;
  padding-left: 20px;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
}

.comment-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.comment-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  font-weight: bold;
}

.comment-header {
  margin-bottom: 4px;
}

@media (max-width: 767px) {
  .comments-container {
    border-left: none;
    border-top: 1px solid #eee;
    margin-top: 20px;
    padding-top: 20px;
    padding-left: 0;
  }
}
</style>