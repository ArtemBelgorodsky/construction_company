<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Строительная компания</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item">
          <span class="icon">📊</span>
          <span class="text">Панель управления</span>
        </router-link>
        <router-link to="/materials" class="nav-item">
          <span class="icon">🧱</span>
          <span class="text">Материалы и услуги</span>
        </router-link>
        <router-link to="/clients" class="nav-item">
          <span class="icon">👥</span>
          <span class="text">Клиенты</span>
        </router-link>
        <router-link to="/reports" class="nav-item">
          <span class="icon">📝</span>
          <span class="text">Отчеты</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="logout" class="logout-button">
          <span class="icon">🚪</span>
          <span class="text">Выйти</span>
        </button>
      </div>
    </aside>
    <main class="content">
      <header class="content-header">
        <h1>{{ title }}</h1>
        <div class="user-info">
          <span>{{ authStore.user?.name }}</span>
        </div>
      </header>
      <div class="content-body">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const title = computed(() => {
  switch (route.name) {
    case 'Dashboard':
      return 'Панель управления';
    case 'Materials':
      return 'Материалы и услуги';
    case 'Clients':
      return 'Клиенты';
    case 'Reports':
      return 'Отчеты';
    default:
      return 'Информационная система';
  }
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.logout-button:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
}

.content-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
  }

  .nav-item {
    padding: 0.5rem 1rem;
  }

  .content-header {
    padding: 1rem;
  }

  .content-body {
    padding: 1rem;
  }
}
</style>
