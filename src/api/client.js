import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000,
});

client.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId');
  if (userId) config.headers['x-demo-user-id'] = userId;
  return config;
});

export default client;
