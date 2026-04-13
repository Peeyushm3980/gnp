import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bountiful-nonpunitory-albert.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' 
  }
});

export default api;