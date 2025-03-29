<template>
  <AppLayout>
    <div class="dashboard">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🧱</div>
          <div class="stat-content">
            <h3>Всего материалов</h3>
            <p class="stat-value">{{ materialsCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Всего клиентов</h3>
            <p class="stat-value">{{ clientsCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-content">
            <h3>Всего покупок</h3>
            <p class="stat-value">{{ purchasesCount }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Общая сумма</h3>
            <p class="stat-value">{{ totalAmount }} ₽</p>
          </div>
        </div>
      </div>

      <div class="recent-section">
        <h2>Последние покупки</h2>
        <div v-if="loading" class="loading">Загрузка...</div>
        <div v-else-if="recentPurchases.length === 0" class="empty-state">
          Нет данных о покупках
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Материалы</th>
              <th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="purchase in recentPurchases" :key="purchase.id">
              <td>{{ formatDate(purchase.date) }}</td>
              <td>{{ getClientName(purchase.clientId) }}</td>
              <td>{{ purchase.items.length }} позиций</td>
              <td>{{ purchase.totalAmount }} ₽</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useMaterialsStore } from '../stores/materials';
import { useClientsStore } from '../stores/clients';

const materialsStore = useMaterialsStore();
const clientsStore = useClientsStore();
const loading = ref(true);

onMounted(async () => {
  try {
    await Promise.all([
      materialsStore.fetchMaterials(),
      clientsStore.fetchClients(),
      clientsStore.fetchPurchases(),
    ]);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    loading.value = false;
  }
});

const materialsCount = computed(() => materialsStore.materials.length);
const clientsCount = computed(() => clientsStore.clients.length);
const purchasesCount = computed(() => clientsStore.purchases.length);
const totalAmount = computed(() => {
  return clientsStore.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );
});

const recentPurchases = computed(() => {
  return [...clientsStore.purchases]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
});

const getClientName = (clientId) => {
  const client = clientsStore.clients.find((c) => c.id === clientId);
  return client ? client.name : 'Неизвестный клиент';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0;
  font-size: 1rem;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0 0;
  color: #333;
}

.recent-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.recent-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #333;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  font-weight: 600;
  color: #666;
}

.loading,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}
</style>
