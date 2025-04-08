
// src/views/Register.vue
<template>
  <div class="register-container">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow">
          <div class="card-body p-5">
            <h2 class="text-center mb-4">Create an Account</h2>
            
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="formData.username" 
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="formData.email" 
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="mb-3">
                <label for="phone_number" class="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone_number" 
                  v-model="formData.phone_number" 
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="formData.password" 
                  required
                  :disabled="loading"
                >
                <div class="form-text">
                  Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password_confirm" class="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password_confirm" 
                  v-model="formData.password_confirm" 
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg" 
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Register
                </button>
              </div>
            </form>
            
            <div class="text-center mt-4">
              <p>Already have an account? <router-link to="/login">Login</router-link></p>
            </div>
          </div>
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
  name: 'UserRegister',
  setup() {
    const store = useStore();
    const router = useRouter();
    
    const formData = reactive({
      username: '',
      email: '',
      phone_number: '',
      password: '',
      password_confirm: ''
    });
    
    const error = ref('');
    const loading = computed(() => store.state.auth.status === 'loading');
    
    const handleSubmit = async () => {
      error.value = '';
      
      // Simple validation
      if (formData.password !== formData.password_confirm) {
        error.value = 'Passwords do not match';
        return;
      }
      
      // Validate password strength (must match backend requirements)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        error.value = 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters';
        return;
      }
      
      try {
        // Convert phone number to integer (per backend model)
        const userData = {
          ...formData,
          phone_number: parseInt(formData.phone_number, 10)
        };
        
        const success = await store.dispatch('auth/register', userData);
        
        if (success) {
          router.push('/');
        }
      } catch (err) {
        if (err.response && err.response.data) {
          error.value = err.response.data.detail || 'Registration failed';
        } else {
          error.value = 'Registration failed. Please try again.';
        }
      }
    };
    
    return {
      formData,
      error,
      loading,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.register-container {
  padding: 3rem 0;
}
</style>