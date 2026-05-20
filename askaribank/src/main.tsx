import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

// Rewrite hardcoded local endpoints to the production server in deployed builds
axios.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('http://localhost:5000/api')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      config.url = config.url.replace('http://localhost:5000/api', apiBase);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
