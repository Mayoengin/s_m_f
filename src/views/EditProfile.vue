// src/views/EditProfile.vue
<template>
  <div class="container py-4">
    <div class="edit-profile-container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h4 class="mb-0">Edit Profile</h4>
            </div>
            
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <!-- Profile Picture Upload -->
                <div class="mb-3 text-center">
                  <input 
                    type="file" 
                    ref="fileInput"
                    class="d-none" 
                    id="profilePicture" 
                    accept="image/*"
                    @change="handleProfilePictureChange"
                  >
                  <div 
                    class="profile-avatar mx-auto mb-3 position-relative"
                    :style="avatarStyle"
                    @click="triggerFileUpload"
                  >
                    <div 
                      v-if="!previewUrl && !currentUser.profile_picture" 
                      class="bg-primary text-white rounded-circle w-100 h-100 d-flex align-items-center justify-content-center"
                    >
                      {{ userInitial }}
                    </div>
                    <div class="avatar-overlay position-absolute">
                      <i class="fas fa-camera"></i>
                    </div>
                  </div>
                  <p class="text-muted small">Click to change profile picture</p>
                </div>
            <!-- Add this inside the form, perhaps near the profile picture upload section -->
                <div class="mb-3 text-center">
                <input 
                    type="file" 
                    ref="backgroundFileInput"
                    class="d-none" 
                    id="backgroundImage" 
                    accept="image/*"
                    @change="handleBackgroundImageChange"
                >
                <div 
                    class="background-image-preview position-relative"
                    :style="backgroundImageStyle"
                    @click="triggerBackgroundFileUpload"
                >
                    <div class="background-overlay position-absolute">
                    <i class="fas fa-camera"></i>
                    <span>Change Background</span>
                    </div>
                </div>
                <p class="text-muted small">Click to change background image</p>
                </div>
                <!-- Username (readonly) -->
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="form.username" 
                    readonly
                  >
                  <small class="form-text text-muted">
                    Username cannot be changed
                  </small>
                </div>
                
                <!-- Email -->
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="form.email" 
                    required
                  >
                </div>
                
                <!-- Phone Number -->
                <div class="mb-3">
                  <label for="phone_number" class="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="phone_number" 
                    v-model="form.phone_number" 
                    required
                  >
                </div>
                
                <!-- Password Change Section -->
                <div class="card mt-4">
                  <div class="card-header">
                    <h5 class="mb-0">Change Password</h5>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label for="current_password" class="form-label">Current Password</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="current_password" 
                        v-model="passwordForm.current_password"
                        placeholder="Enter current password to change password"
                      >
                    </div>
                    
                    <div class="mb-3">
                      <label for="new_password" class="form-label">New Password</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="new_password" 
                        v-model="passwordForm.new_password"
                        placeholder="Leave blank if not changing password"
                      >
                    </div>
                    
                    <div class="mb-3">
                      <label for="confirm_new_password" class="form-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="confirm_new_password" 
                        v-model="passwordForm.confirm_new_password"
                        placeholder="Confirm new password"
                      >
                    </div>
                  </div>
                </div>
                
                <!-- Error Handling -->
                <div v-if="error" class="alert alert-danger mt-3">
                  {{ error }}
                </div>
                
                <!-- Success Message -->
                <div v-if="successMessage" class="alert alert-success mt-3">
                  {{ successMessage }}
                </div>
                
                <!-- Submit Button -->
                <div class="d-flex justify-content-between mt-4">
                  <router-link :to="`/profile/${currentUser.username}`" class="btn btn-outline-secondary">
                    Cancel
                  </router-link>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Save Changes
                  </button>
                </div>
              </form>
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
import { useRouter } from 'vue-router';

export default {
  name: 'EditProfile',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const fileInput = ref(null);
    const previewUrl = ref(null);
    const profilePictureFile = ref(null);
    const backgroundFileInput = ref(null);
    const backgroundPreviewUrl = ref(null);
    const backgroundImageFile = ref(null);

    const currentUser = computed(() => store.getters['auth/currentUser'] || {});
    
    const userInitial = computed(() => {
      return currentUser.value.username?.charAt(0).toUpperCase() || '';
    });
    
    const backgroundImageStyle = computed(() => {
      let imageUrl = backgroundPreviewUrl.value;
      
      if (!imageUrl && currentUser.value.background_image) {
        imageUrl = currentUser.value.background_image;
      }
      
      return {
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '200px',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: imageUrl ? 'transparent' : '#f8f9fa'
      };
    });

    const avatarStyle = computed(() => {
      let imageUrl = previewUrl.value;
      
      if (!imageUrl && currentUser.value.profile_picture) {
        imageUrl = currentUser.value.profile_picture;
      }
      
      return {
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        cursor: 'pointer',
        position: 'relative'
      };
    });

    const form = ref({
      username: '',
      email: '',
      phone_number: ''
    });
    
    const passwordForm = ref({
      current_password: '',
      new_password: '',
      confirm_new_password: ''
    });
    
    const loading = ref(false);
    const error = ref(null);
    const successMessage = ref(null);
    
    // Load initial user data
    onMounted(() => {
      form.value = {
        username: currentUser.value.username,
        email: currentUser.value.email,
        phone_number: currentUser.value.phone_number || ''
      };
    });
    
    const triggerFileUpload = () => {
      fileInput.value.click();
    };
    
    const triggerBackgroundFileUpload = () => {
      backgroundFileInput.value.click();
    };

    const handleProfilePictureChange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = 'Profile picture must be less than 5MB';
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        error.value = 'Please select a valid image file (JPEG, PNG, GIF, or WEBP)';
        return;
      }
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = e => {
        previewUrl.value = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Store the file for later upload
      profilePictureFile.value = file;
      
      // Clear error if any
      error.value = null;
      
      // Show immediate feedback
      successMessage.value = 'Profile picture selected. Click "Save Changes" to update.';
    };

    const handleBackgroundImageChange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        error.value = 'Background image must be less than 10MB';
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        error.value = 'Please select a valid image file (JPEG, PNG, GIF, or WEBP)';
        return;
      }
      
      // Create local preview
      const reader = new FileReader();
      reader.onload = e => {
        backgroundPreviewUrl.value = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Store the file for later upload
      backgroundImageFile.value = file;
      
      // Clear error if any
      error.value = null;
      
      // Show immediate feedback
      successMessage.value = 'Background image selected. Click "Save Changes" to update.';
    };
    
    const updateProfile = async () => {
      // Reset messages
      error.value = null;
      successMessage.value = null;
      
      // Basic validation
      if (passwordForm.value.new_password !== passwordForm.value.confirm_new_password) {
        error.value = 'New passwords do not match';
        return;
      }
      
      // Password validation if new password is provided
      if (passwordForm.value.new_password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(passwordForm.value.new_password)) {
          error.value = 'New password must be at least 8 characters with uppercase, lowercase, numbers, and special characters';
          return;
        }
        
        if (!passwordForm.value.current_password) {
          error.value = 'Current password is required to set a new password';
          return;
        }
      }
      
      loading.value = true;
      
      try {
        // Upload profile picture if selected
        if (profilePictureFile.value) {
          try {
            await store.dispatch('users/uploadProfilePicture', profilePictureFile.value);
            // Reset the file after successful upload
            profilePictureFile.value = null;
          } catch (err) {
            error.value = 'Failed to upload profile picture. Please try again.';
            loading.value = false;
            return;
          }
        }

        // Upload background image if selected
        if (backgroundImageFile.value) {
          try {
            await store.dispatch('users/uploadBackgroundImage', backgroundImageFile.value);
            // Reset the file after successful upload
            backgroundImageFile.value = null;
          } catch (err) {
            error.value = 'Failed to upload background image. Please try again.';
            loading.value = false;
            return;
          }
        }
        
        // Prepare update data for profile info
        const updateData = {
          email: form.value.email,
          phone_number: parseInt(form.value.phone_number, 10) || 0
        };
        
        // Add password update if new password is provided
        if (passwordForm.value.new_password && passwordForm.value.current_password) {
          updateData.current_password = passwordForm.value.current_password;
          updateData.new_password = passwordForm.value.new_password;
        }
        
        // Update user profile
        try {
          await store.dispatch('users/updateUser', updateData);
          successMessage.value = 'Profile updated successfully!';
          
          // Reset password fields after successful update
          passwordForm.value = {
            current_password: '',
            new_password: '',
            confirm_new_password: ''
          };
          
          // Redirect to profile after a short delay
          setTimeout(() => {
            router.push(`/profile/${currentUser.value.username}`);
          }, 1500);
        } catch (err) {
          error.value = err.response?.data?.detail || 'Failed to update profile information';
        }
      } finally {
        loading.value = false;
      }
    };
    
    return {
      form,
      passwordForm,
      loading,
      error,
      successMessage,
      userInitial,
      currentUser,
      fileInput,
      previewUrl,
      avatarStyle,
      triggerFileUpload,
      handleProfilePictureChange,
      updateProfile,
      backgroundFileInput,
      backgroundPreviewUrl,
      backgroundImageStyle,
      triggerBackgroundFileUpload,
      handleBackgroundImageChange
    };
  }
};
</script>
<style scoped>
.edit-profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-avatar {
  position: relative;
  transition: opacity 0.3s ease;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-overlay i {
  font-size: 24px;
}

.background-image-preview {
  position: relative;
  transition: opacity 0.3s ease;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.background-image-preview:hover .background-overlay {
  opacity: 1;
}

.background-overlay i {
  font-size: 24px;
  margin-bottom: 10px;
}
</style>