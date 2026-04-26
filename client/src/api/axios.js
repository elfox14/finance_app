import axios from 'axios';

// الحصول على المسار الأساسي من إعدادات البيئة أو استخدام المسار الافتراضي
const baseURL = import.meta.env.VITE_API_URL || `${import.meta.env.BASE_URL || '/fin/'}api`;

const api = axios.create({
    baseURL: baseURL,
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

// إضافة interceptor للتحقق من صحة الاستجابة (لمنع اعتبار صفحات الـ HTML نجاحاً)
api.interceptors.response.use((response) => {
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
        return Promise.reject(new Error('الخادم عاد بصفحة HTML بدلاً من JSON - تأكد من مسار الـ API'));
    }
    return response;
}, (error) => {
    return Promise.reject(error);
});

export default api;
