import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import AuthContextProvider from './context/AuthContext.tsx';
import './index.css'
import App from './App.tsx'
import axios from 'axios';

// Add global request interceptor to include authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </StrictMode>,
)
