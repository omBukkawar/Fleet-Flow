import axios from 'axios';

// Create an Axios instance with base URL pointing to the local API
export const api = axios.create({
    baseURL: 'http://localhost:3000/api', // To be extracted to .env later
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auth endpoints
export const authApi = axios.create({
    baseURL: 'http://localhost:3000/auth',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to inject JWT from localStorage into every api call
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fleet_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
