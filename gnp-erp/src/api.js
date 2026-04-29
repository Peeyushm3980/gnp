import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bountiful-nonpunitory-albert.ngrok-free.dev/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' 
  }
});

api.interceptors.request.use(
  (config) => {
    // Get the user object stored during login
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.access_token) {
      // Attach the token to the Authorization header
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;