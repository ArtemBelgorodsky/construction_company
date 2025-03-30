<template>
  <AppLayout>
    <div class="materials-page">
      <div class="actions">
        <button @click="showAddModal = true" class="add-button">
          Добавить материал или услугу
        </button>
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск материалов..."
          />
        </div>
      </div>

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else-if="filteredMaterials.length === 0" class="empty-state">
        Материалы не найдены
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Категория</th>
            <th>Единица измерения</th>
            <th>Цена за единицу</th>
            <th>Наличие</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="material in filteredMaterials" :key="material.id">
            <td>{{ material.name }}</td>
            <td>{{ material.category }}</td>
            <td>{{ material.unit }}</td>
            <td>{{ material.price }} ₽</td>
            <td>{{ material.inStock ? 'В наличии' : 'Нет в наличии' }}</td>
            <td class="actions-cell">
              <button @click="editMaterial(material)" class="edit-button">
                Редактировать
              </button>
              <button @click="confirmDelete(material)" class="delete-button">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Add/Edit Material Modal -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>
              {{
                showEditModal ? 'Редактировать материал' : 'Добавить материал'
              }}
            </h2>
            <button @click="closeModal" class="close-button">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitMaterial">
              <div class="form-group">
                <label for="name">Название</label>
                <input
                  type="text"
                  id="name"
                  v-model="currentMaterial.name"
                  required
                />
              </div>
              <div class="form-group">
                <label for="category">Категория</label>
                <select
                  id="category"
                  v-model="currentMaterial.category"
                  required
                >
                  <option value="Строительные смеси">Строительные смеси</option>
                  <option value="Пиломатериалы">Пиломатериалы</option>
                  <option value="Кровельные материалы">
                    Кровельные материалы
                  </option>
                  <option value="Отделочные материалы">
                    Отделочные материалы
                  </option>
                  <option value="Крепежные изделия">Крепежные изделия</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
              <div class="form-group">
                <label for="unit">Единица измерения</label>
                <select id="unit" v-model="currentMaterial.unit" required>
                  <option value="шт">шт</option>
                  <option value="кг">кг</option>
                  <option value="м">м</option>
                  <option value="м²">м²</option>
                  <option value="м³">м³</option>
                  <option value="л">л</option>
                </select>
              </div>
              <div class="form-group">
                <label for="price">Цена за единицу (₽)</label>
                <input
                  type="number"
                  id="price"
                  v-model="currentMaterial.price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div class="form-group checkbox">
                <input
                  type="checkbox"
                  id="inStock"
                  v-model="currentMaterial.inStock"
                />
                <label for="inStock">В наличии</label>
              </div>
              <div class="form-actions">
                <button type="button" @click="closeModal" class="cancel-button">
                  Отмена
                </button>
                <button type="submit" class="submit-button">
                  {{ showEditModal ? 'Сохранить' : 'Добавить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Подтверждение удаления</h2>
            <button @click="showDeleteModal = false" class="close-button">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <p>
              Вы уверены, что хотите удалить материал "{{
                materialToDelete?.name
              }}"?
            </p>
            <div class="form-actions">
              <button @click="showDeleteModal = false" class="cancel-button">
                Отмена
              </button>
              <button @click="deleteMaterial" class="delete-button">
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useMaterialsStore } from '../stores/materials';

const materialsStore = useMaterialsStore();
const loading = ref(true);
const searchQuery = ref('');
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const currentMaterial = ref({
  name: '',
  category: 'Строительные смеси',
  unit: 'шт',
  price: 0,
  inStock: true,
});
const materialToDelete = ref(null);

onMounted(async () => {
  try {
    await materialsStore.fetchMaterials();
  } catch (error) {
    console.error('Error loading materials:', error);
  } finally {
    loading.value = false;
  }
});

const filteredMaterials = computed(() => {
  if (!searchQuery.value) {
    return materialsStore.materials;
  }

  const query = searchQuery.value.toLowerCase();
  return materialsStore.materials.filter(
    (material) =>
      material.name.toLowerCase().includes(query) ||
      material.category.toLowerCase().includes(query)
  );
});

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  currentMaterial.value = {
    name: '',
    category: 'Строительные смеси',
    unit: 'шт',
    price: 0,
    inStock: true,
  };
};

const editMaterial = (material) => {
  currentMaterial.value = { ...material };
  showEditModal.value = true;
};

const confirmDelete = (material) => {
  materialToDelete.value = material;
  showDeleteModal.value = true;
};

const deleteMaterial = async () => {
  if (!materialToDelete.value) return;

  try {
    await materialsStore.deleteMaterial(materialToDelete.value.id);
    showDeleteModal.value = false;
    materialToDelete.value = null;
  } catch (error) {
    console.error('Error deleting material:', error);
  }
};

const submitMaterial = async () => {
  try {
    if (showEditModal.value) {
      await materialsStore.updateMaterial(
        currentMaterial.value.id,
        currentMaterial.value
      );
    } else {
      await materialsStore.addMaterial(currentMaterial.value);
    }
    closeModal();
  } catch (error) {
    console.error('Error saving material:', error);
  }
};
</script>

<style scoped>
.materials-page {
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
  background-color: #4caf50;
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

.data-table th,
.data-table td {
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

.edit-button,
.delete-button {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.edit-button {
  background-color: #2196f3;
  color: white;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.loading,
.empty-state {
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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox input {
  width: auto;
  margin-right: 0.5rem;
}

.form-group.checkbox label {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button,
.submit-button {
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
  background-color: #4caf50;
  color: white;
}
</style>
