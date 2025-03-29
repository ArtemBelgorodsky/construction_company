<template>
  <AppLayout>
    <div class="clients-page">
      <div class="actions">
        <button @click="showAddModal = true" class="add-button">
          Добавить клиента
        </button>
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск клиентов..." 
          />
        </div>
      </div>
      
      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else-if="filteredClients.length === 0" class="empty-state">
        Клиенты не найдены
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Адрес</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in filteredClients" :key="client.id">
            <td>{{ client.name }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.phone }}</td>
            <td>{{ client.address }}</td>
            <td class="actions-cell">
              <button @click="createPurchase(client)" class="purchase-button">
                Создать покупку
              </button>
              <button @click="viewPurchases(client)" class="view-button">
                Покупки
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Add Client Modal -->
      <div v-if="showAddModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Добавить клиента</h2>
            <button @click="showAddModal = false" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addClient">
              <div class="form-group">
                <label for="name">Имя</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="newClient.name" 
                  required
                />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="newClient.email" 
                  required
                />
              </div>
              <div class="form-group">
                <label for="phone">Телефон</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="newClient.phone" 
                  required
                />
              </div>
              <div class="form-group">
                <label for="address">Адрес</label>
                <input 
                  type="text" 
                  id="address" 
                  v-model="newClient.address" 
                  required
                />
              </div>
              <div class="form-actions">
                <button type="button" @click="showAddModal = false" class="cancel-button">
                  Отмена
                </button>
                <button type="submit" class="submit-button">
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Create Purchase Modal -->
      <div v-if="showPurchaseModal" class="modal-overlay">
        <div class="modal purchase-modal">
          <div class="modal-header">
            <h2>Создать покупку для {{ selectedClient?.name }}</h2>
            <button @click="showPurchaseModal = false" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitPurchase">
              <div class="form-group">
                <label>Дата</label>
                <input 
                  type="date" 
                  v-model="newPurchase.date" 
                  required
                />
              </div>
              
              <div class="materials-selection">
                <h3>Выберите материалы</h3>
                <div v-for="(item, index) in newPurchase.items" :key="index" class="purchase-item">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Материал</label>
                      <select v-model="item.materialId" required @change="updateItemPrice(index)">
                        <option v-for="material in materialsStore.materials" :key="material.id" :value="material.id">
                          {{ material.name }} ({{ material.price }} ₽/{{ material.unit }})
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Количество</label>
                      <input 
                        type="number" 
                        v-model="item.quantity" 
                        min="1" 
                        required
                        @change="updateItemTotal(index)"
                      />
                    </div>
                    <div class="form-group">
                      <label>Сумма</label>
                      <input 
                        type="number" 
                        v-model="item.total" 
                        readonly
                      />
                    </div>
                    <button 
                      type="button" 
                      @click="removeItem(index)" 
                      class="remove-button"
                      v-if="newPurchase.items.length > 1"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <button type="button" @click="addItem" class="add-item-button">
                  Добавить материал
                </button>
              </div>
              
              <div class="purchase-summary">
                <div class="total-amount">
                  <span>Итого:</span>
                  <span>{{ calculateTotal() }} ₽</span>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" @click="showPurchaseModal = false" class="cancel-button">
                  Отмена
                </button>
                <button type="submit" class="submit-button">
                  Создать покупку
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- View Purchases Modal -->
      <div v-if="showViewPurchasesModal" class="modal-overlay">
        <div class="modal purchases-modal">
          <div class="modal-header">
            <h2>Покупки клиента {{ selectedClient?.name }}</h2>
            <button @click="showViewPurchasesModal = false" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="clientPurchases.length === 0" class="empty-state">
              У клиента нет покупок
            </div>
            <div v-else class="purchases-list">
              <div v-for="purchase in clientPurchases" :key="purchase.id" class="purchase-card">
                <div class="purchase-header">
                  <div class="purchase-date">{{ formatDate(purchase.date) }}</div>
                  <div class="purchase-total">{{ purchase.totalAmount }} ₽</div>
                </div>
                <div class="purchase-items">
                  <table>
                    <thead>
                      <tr>
                        <th>Материал</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in purchase.items" :key="item.materialId">
                        <td>{{ getMaterialName(item.materialId) }}</td>
                        <td>{{ item.quantity }} {{ getMaterialUnit(item.materialId) }}</td>
                        <td>{{ getMaterialPrice(item.materialId) }} ₽</td>
                        <td>{{ item.total }} ₽</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useClientsStore } from '../stores/clients'
import { useMaterialsStore } from '../stores/materials'

const clientsStore = useClientsStore()
const materialsStore = useMaterialsStore()
const loading = ref(true)
const searchQuery = ref('')
const showAddModal = ref(false)
const showPurchaseModal = ref(false)
const showViewPurchasesModal = ref(false)
const selectedClient = ref(null)
const newClient = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})
const newPurchase = ref({
  date: new Date().toISOString().split('T')[0],
  clientId: '',
  items: [
    {
      materialId: '',
      quantity: 1,
      price: 0,
      total: 0
    }
  ],
  totalAmount: 0
})

onMounted(async () => {
  try {
    await Promise.all([
      clientsStore.fetchClients(),
      materialsStore.fetchMaterials(),
      clientsStore.fetchPurchases()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
})

const filteredClients = computed(() => {
  if (!searchQuery.value) {
    return clientsStore.clients
  }
  
  const query = searchQuery.value.toLowerCase()
  return clientsStore.clients.filter(client => 
    client.name.toLowerCase().includes(query) || 
    client.email.toLowerCase().includes(query) ||
    client.phone.includes(query)
  )
})

const clientPurchases = computed(() => {
  if (!selectedClient.value) return []
  
  return clientsStore.purchases.filter(purchase => 
    purchase.clientId === selectedClient.value.id
  )
})

const addClient = async () => {
  try {
    await clientsStore.addClient(newClient.value)
    showAddModal.value = false
    newClient.value = {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  } catch (error) {
    console.error('Error adding client:', error)
  }
}

const createPurchase = (client) => {
  selectedClient.value = client
  newPurchase.value = {
    date: new Date().toISOString().split('T')[0],
    clientId: client.id,
    items: [
      {
        materialId: '',
        quantity: 1,
        price: 0,
        total: 0
      }
    ],
    totalAmount: 0
  }
  showPurchaseModal.value = true
}

const viewPurchases = (client) => {
  selectedClient.value = client
  showViewPurchasesModal.value = true
}

const addItem = () => {
  newPurchase.value.items.push({
    materialId: '',
    quantity: 1,
    price: 0,
    total: 0
  })
}

const removeItem = (index) => {
  newPurchase.value.items.splice(index, 1)
}

const updateItemPrice = (index) => {
  const item = newPurchase.value.items[index]
  const material = materialsStore.materials.find(m => m.id === item.materialId)
  
  if (material) {
    item.price = material.price
    updateItemTotal(index)
  }
}

const updateItemTotal = (index) => {
  const item = newPurchase.value.items[index]
  item.total = item.price * item.quantity
}

const calculateTotal = () => {
  return newPurchase.value.items.reduce((sum, item) => sum + (item.total || 0), 0)
}

const submitPurchase = async () => {
  try {
    const purchase = {
      ...newPurchase.value,
      totalAmount: calculateTotal()
    }
    
    await clientsStore.addPurchase(purchase)
    showPurchaseModal.value = false
  } catch (error) {
    console.error('Error creating purchase:', error)
  }
}

const getMaterialName = (materialId) => {
  const material = materialsStore.materials.find(m => m.id === materialId)
  return material ? material.name : 'Неизвестный материал'
}

const getMaterialUnit = (materialId) => {
  const material = materialsStore.materials.find(m => m.id === materialId)
  return material ? material.unit : ''
}

const getMaterialPrice = (materialId) => {
  const material = materialsStore.materials.find(m => m.id === materialId)
  return material ? material.price : 0
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.clients-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.search-box input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-size: 1rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #333;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.purchase-button, .view-button {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.purchase-button {
  background-color: #4CAF50;
  color: white;
}

.view-button {
  background-color: #2196F3;
  color: white;
}

.loading, .empty-state {
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.purchase-modal, .purchases-modal {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button, .submit-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #333;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
}

.materials-selection {
  margin-top: 1.5rem;
}

.materials-selection h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.purchase-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.remove-button {
  padding: 0.5rem;
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  height: 40px;
}

.add-item-button {
  padding: 0.5rem 1rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.purchase-summary {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 1.1rem;
}

.purchases-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.purchase-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.purchase-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9f9f9;
  font-weight: 500;
}

.purchase-total {
  font-weight: bold;
}

.purchase-items table {
  width: 100%;
  border-collapse: collapse;
}

.purchase-items th, .purchase-items td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.purchase-items th {
  font-weight: 500;
  color: #666;
}
</style>