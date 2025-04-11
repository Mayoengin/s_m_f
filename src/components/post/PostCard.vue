// src/components/post/PostCard.vue
// src/components/post/PostCard.vue
<template>
  <div class="card mb-4">
    <div class="card-body">
      <!-- Post header -->
      <div class="d-flex mb-3">
        <!-- Use UserAvatar component instead of div -->
        <UserAvatar 
          :username="post.owner.username"
          :profilePicture="post.owner.profile_picture" 
          size="sm" 
          class="me-2" 
          backgroundColor="bg-secondary"
        />
        <div>
          <router-link :to="`/profile/${post.owner.username}`" class="text-decoration-none">
            <h6 class="mb-0">{{ post.owner.username }}</h6>
          </router-link>
          <small class="text-muted">{{ formattedDate }}</small>
        </div>
        

      </div>
      
      <!-- Post content -->
      <router-link :to="`/posts/${post.id}`" class="text-decoration-none text-dark">
        <h5 class="card-title">{{ post.title }}</h5>
        <p class="card-text">{{ truncatedContent }}</p>
        <p v-if="isContentTruncated" class="text-primary mb-0">Read more...</p>
      </router-link>
      
      <!-- Post interactions -->
      <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div class="d-flex align-items-center">
          <button 
            class="btn btn-sm"
            :class="{ 'btn-primary': post.hasVoted, 'btn-outline-primary': !post.hasVoted }"
            @click="vote"
          >
            <i class="fas fa-heart me-1"></i> {{ post.votes || 0 }}
          </button>
          <router-link :to="`/posts/${post.id}`" class="btn btn-sm btn-outline-secondary ms-2">
            <i class="fas fa-comment me-1"></i> {{ commentsCount }}
          </router-link>
        </div>
        
        <router-link :to="`/posts/${post.id}`" class="btn btn-sm btn-outline-primary">
          View Details
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import UserAvatar from '@/components/common/UserAvatar.vue';

export default {
  name: 'PostCard',
  components: {
    UserAvatar
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  emits: ['vote'],
  setup(props, { emit }) {
    const store = useStore();
    const MAX_CONTENT_LENGTH = 200;
    const commentsCount = ref(0);
    
    const currentUser = computed(() => store.getters['auth/currentUser'] || {});
    const isOwner = computed(() => currentUser.value.id === props.post.owner_id);
    
    const truncatedContent = computed(() => {
      if (props.post.content.length <= MAX_CONTENT_LENGTH) {
        return props.post.content;
      }
      return props.post.content.substring(0, MAX_CONTENT_LENGTH) + '...';
    });
    
    const isContentTruncated = computed(() => {
      return props.post.content.length > MAX_CONTENT_LENGTH;
    });
    
    const formattedDate = computed(() => {
      const date = new Date(props.post.created_at);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    });
    
    const vote = () => {
      emit('vote', props.post.id);
    };
    
    const confirmDelete = async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        const success = await store.dispatch('posts/deletePost', props.post.id);
        if (success) {
          // Optionally show a success message
        }
      }
    };
    
    // Fetch comments count (simplified implementation)
    const fetchCommentsCount = async () => {
      try {
        const comments = await store.dispatch('comments/fetchComments', props.post.id);
        commentsCount.value = comments.length;
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };
    
    // Call fetchCommentsCount when component is mounted
    fetchCommentsCount();
    
    return {
      currentUser,
      isOwner,
      truncatedContent,
      isContentTruncated,
      formattedDate,
      vote,
      confirmDelete,
      commentsCount
    };
  }
};
</script>

<style scoped>
/* Remove the .user-avatar styles since we're using the UserAvatar component now */
</style>
<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>