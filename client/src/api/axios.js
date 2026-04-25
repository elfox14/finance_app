import axios from 'axios';

// الحصول على المسار الأساسي من إعدادات Vite أو استخدام المسار الافتراضي
const baseURL = import.meta.env.BASE_URL || '/fin/';

const api = axios.create({
    // ربط مسار الـ API بمسار الموقع لضمان عمله في الاستضافة (Render/Subdirectory)
    baseURL: `${baseURL}api`,
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
