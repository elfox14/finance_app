import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Render will proxy this or we use relative path
});

// إضافة interceptor لإرفاق التوكن في كل طلب بشكل ديناميكي
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
