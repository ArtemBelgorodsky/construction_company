import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isChecked: false,
    loading: false,
    error: null,
  }),

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(
          'https://784c6b116829d23d.mokky.dev/auth',
          credentials
        );

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.user = response.data.user;
          this.isAuthenticated = true;
          this.isChecked = true;
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Authentication failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(
          'https://784c6b116829d23d.mokky.dev/register',
          userData
        );

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.user = response.data.user;
          this.isAuthenticated = true;
        } else {
          throw new Error('Registration failed');
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.isChecked = true;
        this.isAuthenticated = false;
        this.user = null;
        return;
      }

      this.loading = true;

      try {
        const response = await axios.get(
          'https://784c6b116829d23d.mokky.dev/auth_me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data) {
          this.user = response.data;
          this.isAuthenticated = true;
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        localStorage.removeItem('token');
        this.user = null;
        this.isAuthenticated = false;
      } finally {
        this.isChecked = true;
        this.loading = false;
      }
    },

    logout() {
      localStorage.removeItem('token');
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
