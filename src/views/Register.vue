<template>
  <div class="register-container">
    <div class="register-form">
      <h1>Регистрация</h1>
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Имя</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required
            placeholder="Введите имя"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="Введите email"
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Введите пароль"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Подтверждение пароля</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required
            placeholder="Подтвердите пароль"
          />
        </div>
        <button 
          type="submit" 
          :disabled="authStore.loading || password !== confirmPassword"
        >
          {{ authStore.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      <div class="login-link">
        <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    return
  }
  
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: 'admin' // For this application, we're registering admins
    })
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration error:', error)
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.login-link {
  margin-top: 1rem;
  text-align: center;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>