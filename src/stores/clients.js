import { defineStore } from 'pinia';
import axios from 'axios';

export const useClientsStore = defineStore('clients', {
  state: () => ({
    clients: [],
    purchases: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchClients() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://784c6b116829d23d.mokky.dev/clients',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.clients = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch clients';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addClient(client) {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://784c6b116829d23d.mokky.dev/clients',
          client,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.clients.push(response.data);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add client';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPurchases() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://784c6b116829d23d.mokky.dev/purchases',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.purchases = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch purchases';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addPurchase(purchase) {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://784c6b116829d23d.mokky.dev/purchases',
          purchase,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.purchases.push(response.data);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add purchase';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
