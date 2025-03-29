<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Запрашиваемая страница не существует или была перемещена.</p>
      <router-link to="/" class="home-button">Вернуться на главную</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.not-found-content {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #e74c3c;
}

h2 {
  font-size: 2rem;
  margin: 0 0 1rem;
  color: #333;
}

p {
  margin-bottom: 2rem;
  color: #666;
}

.home-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.home-button:hover {
  background-color: #45a049;
}
</style>