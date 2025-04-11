// src/components/common/UserAvatar.vue
<template>
  <div 
    class="user-avatar rounded-circle d-flex align-items-center justify-content-center"
    :class="[sizeClass, backgroundColor]"
    :style="avatarStyle"
  >
    <span v-if="!profilePicture">{{ initial }}</span>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'UserAvatar',
  props: {
    username: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    backgroundColor: {
      type: String,
      default: 'bg-primary'
    }
  },
  setup(props) {
    const initial = computed(() => {
      return props.username?.charAt(0).toUpperCase() || '';
    });
    
    const sizeClass = computed(() => {
      switch(props.size) {
        case 'sm': return 'avatar-sm';
        case 'lg': return 'avatar-lg';
        default: return 'avatar-md';
      }
    });
    
    const avatarStyle = computed(() => {
    // Check that profile picture exists and is not an empty string
    if (props.profilePicture && props.profilePicture.trim() !== '') {
        console.log('Using profile picture:', props.profilePicture);
        return {
        backgroundImage: `url(${props.profilePicture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
        };
    }
    console.log('No valid profile picture found, using initial');
    return {};
    });
    
    return {
      initial,
      sizeClass,
      avatarStyle
    };
  }
};
</script>

<style scoped>
.user-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: white;
  overflow: hidden;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.avatar-md {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.avatar-lg {
  width: 100px;
  height: 100px;
  font-size: 42px;
}
</style>