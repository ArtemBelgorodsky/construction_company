import { defineStore } from 'pinia';
import axios from 'axios';

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    materials: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMaterials() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://784c6b116829d23d.mokky.dev/materials',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.materials = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to fetch materials';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addMaterial(material) {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://784c6b116829d23d.mokky.dev/materials',
          material,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.materials.push(response.data);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to add material';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateMaterial(id, material) {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `https://784c6b116829d23d.mokky.dev/materials/${id}`,
          material,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const index = this.materials.findIndex((m) => m.id === id);
        if (index !== -1) {
          this.materials[index] = response.data;
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to update material';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteMaterial(id) {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `https://784c6b116829d23d.mokky.dev/materials/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.materials = this.materials.filter((m) => m.id !== id);
      } catch (error) {
        this.error =
          error.response?.data?.message || 'Failed to delete material';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
