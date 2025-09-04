import axios from 'axios';

// Set base URL for all axios requests
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sherwoodtech-portfolio-production.up.railway.app'
  : process.env.REACT_APP_API_URL || 'http://localhost:5001';

axios.defaults.baseURL = API_URL;

// Set default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
