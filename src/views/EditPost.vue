
// src/views/EditPost.vue
<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading post...</p>
      </div>
      
      <div v-else-if="!post" class="alert alert-warning">
        Post not found or has been deleted.
      </div>
      
      <div v-else class="card shadow">
        <div class="card-header bg-white">
          <h5 class="mb-0">Edit Post</h5>
        </div>
        
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="title" class="form-label">Title</label>
              <input 
                type="text" 
                class="form-control" 
                id="title" 
                v-model="formData.title" 
                required
                :disabled="saving"
              >
            </div>
            
            <div class="mb-3">
              <label for="content" class="form-label">Content</label>
              <textarea 
                class="form-control" 
                id="content" 
                v-model="formData.content" 
                rows="8"
                required
                :disabled="saving"
              ></textarea>
            </div>
            
            <div class="mb-3 form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="published" 
                v-model="formData.published"
                :disabled="saving"
              >
              <label class="form-check-label" for="published">Published</label>
            </div>
            
            <div class="d-flex justify-content-between">
              <router-link :to="`/posts/${postId}`" class="btn btn-outline-secondary">
                Cancel
              </router-link>
              
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="saving || !isFormValid"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'EditPost',
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    
    const postId = parseInt(route.params.id);
    const loading = ref(true);
    const saving = ref(false);
    const error = ref('');
    
    const formData = reactive({
      title: '',
      content: '',
      published: true
    });
    
    const post = computed(() => store.getters['posts/getCurrentPost']);
    
    const isFormValid = computed(() => {
      return formData.title.trim() && formData.content.trim();
    });
    
    // When post data is loaded, populate the form
    watch(post, (newPost) => {
      if (newPost) {
        formData.title = newPost.title;
        formData.content = newPost.content;
        formData.published = newPost.published;
      }
    });
    
    const fetchPost = async () => {
      loading.value = true;
      try {
        await store.dispatch('posts/fetchPostById', postId);
        
        // Check if current user is the owner
        const currentUser = store.getters['auth/currentUser'];
        if (post.value && post.value.owner_id !== currentUser.id) {
          router.push(`/posts/${postId}`);
        }
      } finally {
        loading.value = false;
      }
    };
    
    const handleSubmit = async () => {
      if (!isFormValid.value) return;
      
      saving.value = true;
      error.value = '';
      
      try {
        const updatedPost = await store.dispatch('posts/updatePost', {
          id: postId,
          postData: {
            title: formData.title,
            content: formData.content,
            published: formData.published
          }
        });
        
        if (updatedPost) {
          router.push(`/posts/${postId}`);
        } else {
          error.value = 'Failed to update post. Please try again.';
        }
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to update post';
      } finally {
        saving.value = false;
      }
    };
    
    onMounted(fetchPost);
    
    return {
      post,
      postId,
      formData,
      loading,
      saving,
      error,
      isFormValid,
      handleSubmit
    };
  }
};
</script>