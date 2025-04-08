// src/views/Login.vue
<template>
  <div class="login-container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body p-5">
            <h2 class="text-center mb-4 app-title">Login</h2>
           
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
                  v-model="username"
                  required
                  :disabled="loading"
                  placeholder="Enter your username"
                >
              </div>
             
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="password-field">
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="password"
                    required
                    :disabled="loading"
                    placeholder="Enter your password"
                  >
                </div>
              </div>
             
              <div class="d-grid gap-2 mt-4">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg login-btn"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <span>{{ loading ? 'Logging in...' : 'Login' }}</span>
                </button>
              </div>
            </form>
           
            <div class="text-center mt-4">
              <p class="register-link">
                Don't have an account? 
                <router-link to="/register" class="register-btn">Register</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'LoginPage',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
   
    const username = ref('');
    const password = ref('');
    const error = ref('');
   
    const loading = computed(() => store.state.auth.status === 'loading');
   
    const handleSubmit = async () => {
      // Reset error and set loading state
      error.value = '';
     
      // Validate input
      if (!username.value || !password.value) {
        error.value = 'Please enter both username and password';
        return;
      }
     
      try {
        // Start loading state
        store.commit('auth/auth_request');
       
        const success = await store.dispatch('auth/login', {
          username: username.value,
          password: password.value
        });
       
        if (success) {
          // Redirect to the original requested page or home
          const redirectPath = route.query.redirect || '/';
          router.push(redirectPath);
        } else {
          // Handle login failure
          error.value = 'Login failed. Please check your credentials.';
        }
      } catch (err) {
        // Comprehensive error handling
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          switch (err.response.status) {
            case 401:
              error.value = 'Invalid username or password';
              break;
            case 404:
              error.value = 'Server not found. Please check your connection.';
              break;
            case 500:
              error.value = 'Server error. Please try again later.';
              break;
            default:
              error.value = err.response.data?.detail || 'An unexpected error occurred';
          }
        } else if (err.request) {
          // The request was made but no response was received
          error.value = 'No response from server. Please check your network connection.';
        } else {
          // Something happened in setting up the request that triggered an Error
          error.value = 'Error setting up login request. Please try again.';
        }
        
        // Log the full error for debugging
        console.error('Login error:', err);
        
        // Ensure loading state is reset
        store.commit('auth/auth_error');
      }
    };
   
    return {
      username,
      password,
      error,
      loading,
      handleSubmit
    };
  }
};
</script>

<style scoped>
/* Login container layout */
.login-container {
  min-height: 80vh;
  align-items: center;
  padding: 2rem 1rem;
  background-color: #f8f9fa;
}

/* Card styling */
.card {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.card-body {
  border-radius: 0.75rem;
}

/* Typography */
.app-title {
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
}

.app-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #0d6efd;
  border-radius: 3px;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

/* Form elements */
.form-control {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ced4da;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-control::placeholder {
  color: #adb5bd;
}

.password-field {
  position: relative;
}

/* Button styling */
.login-btn {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.login-btn:hover:not(:disabled) {
  background-color: #0b5ed7;
  border-color: #0b5ed7;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.login-btn:disabled {
  background-color: #0d6efd;
  border-color: #0d6efd;
  opacity: 0.65;
}

/* Alert styling */
.alert {
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

/* Register link */
.register-link {
  margin-top: 1rem;
  color: #6c757d;
}

.register-btn {
  color: #0d6efd;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
  margin-left: 0.25rem;
}

.register-btn:hover {
  color: #0b5ed7;
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .login-container {
    padding: 1rem 0.5rem;
  }

  .card {
    border-radius: 0.5rem;
  }

  .card-body {
    padding: 1.5rem !important;
  }

  .app-title::after {
    width: 40px;
  }
}
</style>