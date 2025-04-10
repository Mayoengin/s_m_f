<template>
  <div class="create-reel-container">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h4 class="m-0">{{ isEditing ? 'Edit Reel' : 'Create New Reel' }}</h4>
      </div>
      
      <div class="card-body">
        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="title" class="form-label">Title</label>
            <input 
              type="text" 
              class="form-control" 
              id="title" 
              v-model="form.title" 
              required
              placeholder="Enter a title for your reel"
            >
          </div>
          
          <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea 
              class="form-control" 
              id="description" 
              v-model="form.description" 
              rows="3" 
              placeholder="Add a description to your reel"
            ></textarea>
          </div>
          
          <div class="mb-3">
            <label for="videoFile" class="form-label">Video File</label>
            <div class="input-group">
              <input 
                type="file" 
                class="form-control" 
                id="videoFile" 
                @change="handleFileChange" 
                :required="!isEditing"
                accept="video/*"
                ref="fileInput"
              >
              <button 
                v-if="form.videoFile" 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="clearSelectedFile"
              >
                Clear
              </button>
            </div>
            <div class="form-text">
              Supported formats: MP4, WebM, MOV. Max size: 50MB.
            </div>
            
            <div v-if="form.videoFile" class="mt-2">
              <div class="d-flex align-items-center">
                <i class="fas fa-check-circle text-success me-2"></i>
                <div>
                  <div>{{ form.videoFile.name }}</div>
                  <small class="text-muted">{{ formatFileSize(form.videoFile.size) }} - {{ form.videoFile.type }}</small>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Video preview section -->
          <div v-if="videoPreview" class="video-preview-container mb-3">
            <h5>Preview</h5>
            <div class="video-preview">
              <video ref="videoPreviewElement" controls class="preview-video">
                <source :src="videoPreview" :type="videoMimeType">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-3">
            <label class="form-label">Upload Progress</label>
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{ width: uploadProgress + '%' }" 
                   :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
                {{ uploadProgress }}%
              </div>
            </div>
          </div>
          
          <div class="d-flex justify-content-between mt-4">
            <router-link to="/reels" class="btn btn-outline-secondary">
              Cancel
            </router-link>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="loading || uploadProgress > 0"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isEditing ? 'Update Reel' : 'Upload Reel' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'CreateReel',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    
    const form = ref({
      title: '',
      description: '',
      videoFile: null
    });
    
    const fileInput = ref(null);
    const videoPreview = ref(null);
    const videoMimeType = ref('video/mp4');
    const videoPreviewElement = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const uploadProgress = ref(0);
    
    const reelId = computed(() => {
      return route.params.id ? parseInt(route.params.id) : null;
    });
    
    const isEditing = computed(() => !!reelId.value);
    
    const loadReelData = async () => {
      if (!isEditing.value) return;
      
      loading.value = true;
      try {
        const reel = await store.dispatch('reels/fetchReelById', reelId.value);
        
        if (reel) {
          form.value.title = reel.title;
          form.value.description = reel.description;
          
          // Set the video preview from the existing reel
          if (reel.video_url) {
            videoPreview.value = reel.video_url;
            
            // Try to determine the MIME type from URL extension
            const fileExtension = reel.video_url.split('.').pop().toLowerCase();
            if (fileExtension === 'mp4') {
              videoMimeType.value = 'video/mp4';
            } else if (fileExtension === 'webm') {
              videoMimeType.value = 'video/webm';
            } else if (fileExtension === 'mov') {
              videoMimeType.value = 'video/quicktime';
            }
          }
        } else {
          error.value = 'Reel not found';
          router.push('/reels');
        }
      } catch (err) {
        error.value = 'Failed to load reel data';
        console.error('Error loading reel:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) {
        clearSelectedFile();
        return;
      }
      
      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        error.value = 'File size exceeds 50MB limit. Please choose a smaller file.';
        event.target.value = '';
        return;
      }
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        error.value = 'Invalid file type. Please select MP4, WebM, or MOV video file.';
        event.target.value = '';
        return;
      }
      
      // Clear previous errors
      error.value = null;
      
      // Save the file to form data
      form.value.videoFile = file;
      videoMimeType.value = file.type;
      
      console.log('Selected file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Create video preview
      const reader = new FileReader();
      reader.onload = (e) => {
        videoPreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    
    const clearSelectedFile = () => {
      form.value.videoFile = null;
      videoPreview.value = null;
      
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      
      if (videoPreviewElement.value) {
        videoPreviewElement.value.src = '';
      }
      
      // If we're editing, we need to reset to the original video preview
      if (isEditing.value) {
        loadReelData();
      }
    };
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const submitForm = async () => {
      // Validate form
      if (!form.value.title) {
        error.value = 'Title is required';
        return;
      }
      
      if (!isEditing.value && !form.value.videoFile) {
        error.value = 'Video file is required';
        return;
      }
      
      error.value = null;
      loading.value = true;
      uploadProgress.value = 0;
      
      try {
        let result;
        
        // Create config for upload progress tracking
        const config = {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            uploadProgress.value = percentCompleted;
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        };
        
        if (isEditing.value) {
          // Update existing reel
          result = await store.dispatch('reels/updateReel', {
            id: reelId.value,
            reelData: form.value,
            config
          });
          
          if (result) {
            router.push(`/reels/${reelId.value}`);
          } else {
            throw new Error('Failed to update reel');
          }
        } else {
          // Create new reel
          result = await store.dispatch('reels/createReel', {
            ...form.value,
            config
          });
          
          if (result) {
            router.push(`/reels/${result.id}`);
          } else {
            throw new Error('Failed to create reel');
          }
        }
      } catch (err) {
        console.error('Error submitting reel:', err);
        error.value = err.message || 'An error occurred while saving the reel';
      } finally {
        loading.value = false;
        uploadProgress.value = 0;
      }
    };
    
    onMounted(() => {
      if (isEditing.value) {
        loadReelData();
      }
    });
    
    // Clear any previous store data when component is mounted
    store.commit('reels/set_current_reel', null);
    
    return {
      form,
      fileInput,
      videoPreview,
      videoMimeType,
      videoPreviewElement,
      loading,
      error,
      uploadProgress,
      isEditing,
      handleFileChange,
      clearSelectedFile,
      formatFileSize,
      submitForm
    };
  }
};
</script>

<style scoped>
.create-reel-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 15px;
}

.video-preview-container {
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  background-color: #f8f9fa;
}

.video-preview {
  max-width: 100%;
  display: flex;
  justify-content: center;
}

.preview-video {
  max-height: 300px;
  max-width: 100%;
  border-radius: 4px;
}
</style>