<template>
  <AppLayout>
    <div class="reports-page">
      <div class="report-filters">
        <div class="filter-group">
          <label>Период</label>
          <div class="date-range">
            <input
              type="date"
              v-model="filters.startDate"
              :max="filters.endDate"
            />
            <span>—</span>
            <input
              type="date"
              v-model="filters.endDate"
              :min="filters.startDate"
            />
          </div>
        </div>
        <div class="filter-group">
          <label>Клиент</label>
          <select v-model="filters.clientId">
            <option value="">Все клиенты</option>
            <option
              v-for="client in clientsStore.clients"
              :key="client.id"
              :value="client.id"
            >
              {{ client.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>Материал</label>
          <select v-model="filters.materialId">
            <option value="">Все материалы</option>
            <option
              v-for="material in materialsStore.materials"
              :key="material.id"
              :value="material.id"
            >
              {{ material.name }}
            </option>
          </select>
        </div>
        <button @click="generateReport" class="generate-button">
          Сформировать отчет
        </button>
      </div>

      <div v-if="loading" class="loading">Загрузка...</div>

      <div v-else-if="reportGenerated" class="report-container">
        <div class="report-header">
          <h2>Отчет по продажам</h2>
          <div class="report-actions">
            <button @click="printReport" class="print-button">Печать</button>
            <button @click="downloadPDF" class="download-button">
              Скачать PDF
            </button>
          </div>
        </div>

        <div class="report-info">
          <div class="report-period">
            <strong>Период:</strong> {{ formatDate(filters.startDate) }} —
            {{ formatDate(filters.endDate) }}
          </div>
          <div v-if="filters.clientId" class="report-client">
            <strong>Клиент:</strong> {{ getClientName(filters.clientId) }}
          </div>
          <div v-if="filters.materialId" class="report-material">
            <strong>Материал:</strong> {{ getMaterialName(filters.materialId) }}
          </div>
        </div>

        <div id="report-content" class="report-content">
          <div v-if="filteredPurchases.length === 0" class="empty-state">
            Нет данных для отображения
          </div>
          <div v-else>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Материалы</th>
                  <th>Количество</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in filteredPurchases" :key="purchase.id">
                  <td>{{ formatDate(purchase.date) }}</td>
                  <td>{{ getClientName(purchase.clientId) }}</td>
                  <td>
                    <div
                      v-for="item in getFilteredItems(purchase)"
                      :key="item.materialId"
                      class="material-item"
                    >
                      {{ getMaterialName(item.materialId) }}
                    </div>
                  </td>
                  <td>
                    <div
                      v-for="item in getFilteredItems(purchase)"
                      :key="item.materialId"
                      class="material-item"
                    >
                      {{ item.quantity }} {{ getMaterialUnit(item.materialId) }}
                    </div>
                  </td>
                  <td>{{ getFilteredTotal(purchase) }} ₽</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="total-label">Итого:</td>
                  <td class="total-value">{{ calculateTotalAmount() }} ₽</td>
                </tr>
              </tfoot>
            </table>

            <div class="report-summary">
              <h3>Сводная информация</h3>
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-title">Всего продаж</div>
                  <div class="summary-value">
                    {{ filteredPurchases.length }}
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-title">Всего клиентов</div>
                  <div class="summary-value">{{ uniqueClients.length }}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-title">Всего материалов</div>
                  <div class="summary-value">{{ uniqueMaterials.length }}</div>
                </div>
                <div class="summary-card">
                  <div class="summary-title">Общая сумма</div>
                  <div class="summary-value">
                    {{ calculateTotalAmount() }} ₽
                  </div>
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
import { ref, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AppLayout from '../components/AppLayout.vue';
import { useClientsStore } from '../stores/clients';
import { useMaterialsStore } from '../stores/materials';

const clientsStore = useClientsStore();
const materialsStore = useMaterialsStore();
const loading = ref(true);
const reportGenerated = ref(false);

const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  clientId: '',
  materialId: '',
});

onMounted(async () => {
  try {
    await Promise.all([
      clientsStore.fetchClients(),
      materialsStore.fetchMaterials(),
      clientsStore.fetchPurchases(),
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
});

const generateReport = () => {
  reportGenerated.value = true;
};

const filteredPurchases = computed(() => {
  if (!reportGenerated.value) return [];

  return clientsStore.purchases.filter((purchase) => {
    // Filter by date range
    const purchaseDate = new Date(purchase.date);
    const startDate = new Date(filters.value.startDate);
    const endDate = new Date(filters.value.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the end date fully

    if (purchaseDate < startDate || purchaseDate > endDate) {
      return false;
    }

    // Filter by client
    if (
      filters.value.clientId &&
      purchase.clientId !== filters.value.clientId
    ) {
      return false;
    }

    // Filter by material
    if (filters.value.materialId) {
      const hasMaterial = purchase.items.some(
        (item) => item.materialId === filters.value.materialId
      );
      if (!hasMaterial) {
        return false;
      }
    }

    return true;
  });
});

const getFilteredItems = (purchase) => {
  if (!filters.value.materialId) {
    return purchase.items;
  }

  return purchase.items.filter(
    (item) => item.materialId === filters.value.materialId
  );
};

const getFilteredTotal = (purchase) => {
  if (!filters.value.materialId) {
    return purchase.totalAmount;
  }

  return getFilteredItems(purchase).reduce((sum, item) => sum + item.total, 0);
};

const uniqueClients = computed(() => {
  const clientIds = new Set(filteredPurchases.value.map((p) => p.clientId));
  return Array.from(clientIds);
});

const uniqueMaterials = computed(() => {
  const materialIds = new Set();

  filteredPurchases.value.forEach((purchase) => {
    purchase.items.forEach((item) => {
      if (
        !filters.value.materialId ||
        item.materialId === filters.value.materialId
      ) {
        materialIds.add(item.materialId);
      }
    });
  });

  return Array.from(materialIds);
});

const calculateTotalAmount = () => {
  return filteredPurchases.value.reduce((sum, purchase) => {
    return sum + getFilteredTotal(purchase);
  }, 0);
};

const getClientName = (clientId) => {
  const client = clientsStore.clients.find((c) => c.id === clientId);
  return client ? client.name : 'Неизвестный клиент';
};

const getMaterialName = (materialId) => {
  const material = materialsStore.materials.find((m) => m.id === materialId);
  return material ? material.name : 'Неизвестный материал';
};

const getMaterialUnit = (materialId) => {
  const material = materialsStore.materials.find((m) => m.id === materialId);
  return material ? material.unit : '';
};

const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const printReport = () => {
  const content = document.getElementById('report-content');
  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <title>Отчет по продажам</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          .report-info {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .total-label {
            text-align: right;
            font-weight: bold;
          }
          .total-value {
            font-weight: bold;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .summary-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
          }
          .summary-title {
            font-size: 14px;
            color: #666;
          }
          .summary-value {
            font-size: 18px;
            font-weight: bold;
            margin-top: 5px;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h2>Отчет по продажам</h2>
        <div class="report-info">
          <div><strong>Период:</strong> ${formatDate(
            filters.value.startDate
          )} — ${formatDate(filters.value.endDate)}</div>
          ${
            filters.value.clientId
              ? `<div><strong>Клиент:</strong> ${getClientName(
                  filters.value.clientId
                )}</div>`
              : ''
          }
          ${
            filters.value.materialId
              ? `<div><strong>Материал:</strong> ${getMaterialName(
                  filters.value.materialId
                )}</div>`
              : ''
          }
        </div>
        ${content.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

const downloadPDF = () => {
  const doc = new jsPDF();

  // Добавляем поддержку кириллицы
  doc.addFont(
    'https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5Q.ttf',
    'Roboto',
    'normal'
  );
  doc.setFont('Roboto');

  doc.setFontSize(12);
  doc.text('Отчет по продажам', 105, 15, { align: 'center' });

  // Добавляем информацию отчета
  doc.setFontSize(12);
  doc.text(
    `Период: ${formatDate(filters.value.startDate)} — ${formatDate(
      filters.value.endDate
    )}`,
    14,
    25
  );

  let yPos = 30;

  if (filters.value.clientId) {
    doc.text(`Клиент: ${getClientName(filters.value.clientId)}`, 14, yPos);
    yPos += 5;
  }

  if (filters.value.materialId) {
    doc.text(
      `Материал: ${getMaterialName(filters.value.materialId)}`,
      14,
      yPos
    );
    yPos += 5;
  }

  // Добавляем таблицу с поддержкой кириллицы
  if (filteredPurchases.value.length > 0) {
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Дата', 'Клиент', 'Материалы', 'Количество', 'Сумма']],
      body: filteredPurchases.value.map((purchase) => [
        formatDate(purchase.date),
        getClientName(purchase.clientId),
        getFilteredItems(purchase)
          .map((item) => getMaterialName(item.materialId))
          .join(', '),
        getFilteredItems(purchase)
          .map((item) => `${item.quantity} ${getMaterialUnit(item.materialId)}`)
          .join(', '),
        `${getFilteredTotal(purchase)} ₽`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: {
        font: 'Roboto',
        fontStyle: 'normal',
      },
    });

    // Add summary
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text('Сводная информация', 14, finalY);

    doc.setFontSize(12);
    doc.text(
      `Всего продаж: ${filteredPurchases.value.length}`,
      14,
      finalY + 10
    );
    doc.text(`Всего клиентов: ${uniqueClients.value.length}`, 14, finalY + 20);
    doc.text(
      `Всего материалов: ${uniqueMaterials.value.length}`,
      14,
      finalY + 30
    );
    doc.text(`Общая сумма: ${calculateTotalAmount()} ₽`, 14, finalY + 40);
  } else {
    doc.text('Нет данных для отображения', 14, yPos + 10);
  }

  doc.save('отчет.pdf');
};
</script>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #666;
}

.filter-group select,
.filter-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  min-width: 150px;
}

.generate-button {
  margin-left: auto;
  align-self: flex-end;
  padding: 0.75rem 1.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.report-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.report-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.report-actions {
  display: flex;
  gap: 1rem;
}

.print-button,
.download-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.print-button {
  background-color: #2196f3;
  color: white;
}

.download-button {
  background-color: #ff9800;
  color: white;
}

.report-info {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.report-table th,
.report-table td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #ddd;
}

.report-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.material-item {
  margin-bottom: 0.25rem;
}

.material-item:last-child {
  margin-bottom: 0;
}

.total-label {
  text-align: right;
  font-weight: bold;
}

.total-value {
  font-weight: bold;
}

.report-summary {
  margin-top: 2rem;
}

.report-summary h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}

.summary-title {
  font-size: 0.875rem;
  color: #666;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

.loading,
.empty-state {
  padding: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .report-filters {
    flex-direction: column;
  }

  .generate-button {
    margin-left: 0;
    width: 100%;
  }

  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .report-actions {
    width: 100%;
  }

  .print-button,
  .download-button {
    flex: 1;
  }
}
</style>
