// src/views/PostDetail.vue (continued)
<template>
  <div v-if="loading" class="text-center my-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-2">Loading post...</p>
  </div>
  
  <div v-else-if="!post" class="alert alert-warning">
    Post not found or has been deleted.
  </div>
  
  <div v-else class="post-detail">
    <div class="card mb-4">
      <div class="card-body">
        <!-- Post header -->
        <div class="d-flex align-items-center mb-3">
          <!-- Use profile picture when available -->
          <UserAvatar 
            :username="post.owner.username"
            :profilePicture="post.owner.profile_picture" 
            size="md" 
            class="me-3" 
            backgroundColor="bg-secondary"
          />
          <div>
            <router-link :to="`/profile/${post.owner.username}`" class="text-decoration-none">
              <h5 class="mb-0">{{ post.owner.username }}</h5>
            </router-link>
            <small class="text-muted">{{ formattedDate }}</small>
          </div>
          
          <!-- Post actions dropdown for post owner -->
          <div v-if="isOwner" class="dropdown ms-auto">
            <button class="btn btn-sm" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link :to="`/edit-post/${post.id}`" class="dropdown-item">
                  <i class="fas fa-edit me-2"></i> Edit
                </router-link>
              </li>
              <li>
                <a href="#" class="dropdown-item text-danger" @click.prevent="confirmDelete">
                  <i class="fas fa-trash-alt me-2"></i> Delete
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Post content -->
        <h2 class="card-title">{{ post.title }}</h2>
        <p class="card-text">{{ post.content }}</p>
        
        <!-- Post interactions -->
        <div class="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <div class="d-flex align-items-center">
            <button 
              class="btn"
              :class="{ 'btn-primary': post.hasVoted, 'btn-outline-primary': !post.hasVoted }"
              @click="vote"
            >
              <i class="fas fa-heart me-1"></i> {{ post.votes || 0 }}
            </button>
            <button class="btn btn-outline-secondary ms-2" disabled>
              <i class="fas fa-comment me-1"></i> {{ comments.length }}
            </button>
          </div>
          
          <div v-if="isOwner">
            <router-link :to="`/edit-post/${post.id}`" class="btn btn-primary">
              <i class="fas fa-edit me-1"></i> Edit
            </router-link>
            <button @click="confirmDelete" class="btn btn-danger ms-2">
              <i class="fas fa-trash-alt me-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Comments section -->
    <div class="card">
      <div class="card-header bg-white">
        <h5 class="mb-0">Comments ({{ comments.length }})</h5>
      </div>
      
      <div class="card-body">
        <!-- New comment form -->
        <div class="mb-4">
          <div class="d-flex">
            <!-- Use profile picture when available -->
            <UserAvatar 
              :username="currentUser.username"
              :profilePicture="currentUser.profile_picture" 
              size="sm" 
              class="me-2" 
              backgroundColor="bg-primary"
            />
            <div class="flex-grow-1">
              <textarea 
                v-model="newComment" 
                class="form-control mb-2" 
                rows="2" 
                placeholder="Write a comment..."
              ></textarea>
              <div class="text-end">
                <button 
                  @click="addComment" 
                  class="btn btn-primary" 
                  :disabled="!newComment.trim() || commentLoading"
                >
                  <span v-if="commentLoading" class="spinner-border spinner-border-sm me-1"></span>
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Comments list -->
        <div v-if="commentsLoading" class="text-center my-4">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading comments...</span>
          </div>
          <p class="mt-2">Loading comments...</p>
        </div>
        
        <div v-else-if="comments.length === 0" class="text-center my-4">
          <p class="text-muted">No comments yet. Be the first to comment!</p>
        </div>
        
        <div v-else>
          <div v-for="comment in comments" :key="comment.id" class="comment mb-3">
            <div class="d-flex">
              <!-- Use profile picture when available -->
              <UserAvatar 
                :username="comment.user.username"
                :profilePicture="comment.user.profile_picture" 
                size="sm" 
                class="me-2" 
                backgroundColor="bg-secondary"
              />
              <div class="flex-grow-1">
                <div class="comment-bubble p-3">
                  <div class="d-flex justify-content-between mb-1">
                    <router-link :to="`/profile/${comment.user.username}`" class="text-decoration-none">
                      <strong>{{ comment.user.username }}</strong>
                    </router-link>
                    <small class="text-muted">{{ formatDate(comment.created_at) }}</small>
                  </div>
                  <p class="mb-0">{{ comment.content }}</p>
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
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import UserAvatar from '@/components/common/UserAvatar.vue';

export default {
  name: 'PostDetail',
  components: {
    UserAvatar
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    
    const postId = parseInt(route.params.id);
    const loading = ref(true);
    const commentsLoading = ref(true);
    const commentLoading = ref(false);
    const newComment = ref('');
    
    const currentUser = computed(() => store.getters['auth/currentUser'] || {});
    const post = computed(() => store.getters['posts/getCurrentPost']);
    const comments = computed(() => store.getters['comments/getCommentsByPostId'](postId) || []);
    
    const isOwner = computed(() => currentUser.value.id === post.value?.owner_id);
    
    const formattedDate = computed(() => {
      if (!post.value?.created_at) return '';
      
      const date = new Date(post.value.created_at);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const fetchPost = async () => {
      loading.value = true;
      try {
        await store.dispatch('posts/fetchPostById', postId);
      } finally {
        loading.value = false;
      }
    };
    
    const fetchComments = async () => {
      commentsLoading.value = true;
      try {
        await store.dispatch('comments/fetchComments', postId);
      } finally {
        commentsLoading.value = false;
      }
    };
    
    const vote = async () => {
      await store.dispatch('posts/votePost', postId);
    };
    
    const addComment = async () => {
      if (!newComment.value.trim()) return;
      
      commentLoading.value = true;
      try {
        await store.dispatch('comments/createComment', {
          postId,
          content: newComment.value
        });
        newComment.value = '';
      } finally {
        commentLoading.value = false;
      }
    };
    
    const confirmDelete = async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        const success = await store.dispatch('posts/deletePost', postId);
        if (success) {
          router.push('/');
        }
      }
    };
    
    onMounted(async () => {
      await fetchPost();
      await fetchComments();
    });
    
    return {
      post,
      loading,
      commentsLoading,
      commentLoading,
      comments,
      newComment,
      currentUser,
      isOwner,
      formattedDate,
      formatDate,
      vote,
      addComment,
      confirmDelete
    };
  }
};
</script>



<style scoped>
.comment-bubble {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}
</style>