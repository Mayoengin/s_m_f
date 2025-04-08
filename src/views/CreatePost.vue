// src/views/CreatePost.vue
<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card shadow">
        <div class="card-header bg-white">
          <h5 class="mb-0">Create New Post</h5>
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
                :disabled="loading"
                placeholder="Enter a title for your post"
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
                :disabled="loading"
                placeholder="Write your post content here..."
              ></textarea>
            </div>
            
            <div class="mb-3 form-check">
              <input 
                type="checkbox" 
                class="form-check-input" 
                id="published" 
                v-model="formData.published"
                :disabled="loading"
              >
              <label class="form-check-label" for="published">Publish this post</label>
            </div>
            
            <div class="d-flex justify-content-between">
              <router-link to="/" class="btn btn-outline-secondary">
                Cancel
              </router-link>
              
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'CreatePost',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const formData = reactive({
      title: '',
      content: '',
      published: true
    });
    
    const error = ref('');
    const loading = ref(false);
    
    const isFormValid = computed(() => {
      return formData.title.trim() && formData.content.trim();
    });
    
    const handleSubmit = async () => {
      if (!isFormValid.value) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        const newPost = await store.dispatch('posts/createPost', formData);
        if (newPost) {
          router.push(`/posts/${newPost.id}`);
        } else {
          error.value = 'Failed to create post. Please try again.';
        }
      } catch (err) {
        error.value = err.response?.data?.detail || 'Failed to create post';
      } finally {
        loading.value = false;
      }
    };
    
    return {
      formData,
      error,
      loading,
      isFormValid,
      handleSubmit
    };
  }
};
</script>
