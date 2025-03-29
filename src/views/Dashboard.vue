<template>
  <AppLayout>
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">Аналитика продаж</h1>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-content">
              <h3>Всего материалов</h3>
              <p class="stat-value">{{ materialsCount }}</p>
              <div class="stat-change positive">
                <i class="fas fa-arrow-up"></i> 12% с прошлого месяца
              </div>
            </div>
            <div class="stat-icon">
              <i class="fas fa-cubes"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-content">
              <h3>Всего клиентов</h3>
              <p class="stat-value">{{ clientsCount }}</p>
              <div class="stat-change positive">
                <i class="fas fa-arrow-up"></i> 8% с прошлого месяца
              </div>
            </div>
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-content">
              <h3>Всего покупок</h3>
              <p class="stat-value">{{ purchasesCount }}</p>
              <div class="stat-change negative">
                <i class="fas fa-arrow-down"></i> 3% с прошлого месяца
              </div>
            </div>
            <div class="stat-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-content">
              <h3>Общая сумма</h3>
              <p class="stat-value">{{ totalAmount }} ₽</p>
              <div class="stat-change positive">
                <i class="fas fa-arrow-up"></i> 15% с прошлого месяца
              </div>
            </div>
            <div class="stat-icon">
              <i class="fas fa-ruble-sign"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Последние покупки</h2>
          <div>
            <button class="btn btn-outline">
              <i class="fas fa-filter"></i> Фильтр
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading">Загрузка...</div>
        <div v-else-if="recentPurchases.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>Нет данных о покупках</p>
        </div>
        <div v-else class="table-responsive">
          <table class="data-table">
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
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
}

.stat-card:nth-child(1)::before {
  background-color: var(--primary);
}
.stat-card:nth-child(2)::before {
  background-color: var(--success);
}
.stat-card:nth-child(3)::before {
  background-color: var(--warning);
}
.stat-card:nth-child(4)::before {
  background-color: var(--danger);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-card:nth-child(1) .stat-icon {
  background-color: var(--primary);
}
.stat-card:nth-child(2) .stat-icon {
  background-color: var(--success);
}
.stat-card:nth-child(3) .stat-icon {
  background-color: var(--warning);
}
.stat-card:nth-child(4) .stat-icon {
  background-color: var(--danger);
}
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
