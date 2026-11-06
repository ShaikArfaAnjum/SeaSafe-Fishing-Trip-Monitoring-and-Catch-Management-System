// ============================================================
// src/api.js
// Central Axios instance for making API requests to the backend.
// Handles automatic JWT token attachment and 401 redirect to login.
// ============================================================

import axios from 'axios';

// Create the axios instance with baseURL from .env (fallback to relative /api in production)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Request interceptor: attach Bearer token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 Unauthorised, clear storage and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

