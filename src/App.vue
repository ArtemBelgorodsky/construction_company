<template>
  <div class="app-container">
    <router-view />
  </div>
</template>
<script>
import { useAuthStore } from './stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  async mounted() {
    await this.authStore.checkAuth();
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
}

.app-container {
  min-height: 100vh;
}
</style>
