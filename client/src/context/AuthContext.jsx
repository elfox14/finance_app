import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setUser(null);
            return;
        }

        try {
            // إضافة timeout للطلب لضمان عدم تعليق الواجهة في حالة بطء السيرفر
            const res = await api.get('/auth/me', { timeout: 5000 });
            setUser(res.data);
        } catch (err) {
            console.error('Auth Check Failed:', err.message);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            // تأخير بسيط لضمان استقرار الحالة قبل الرندر
            setTimeout(() => setLoading(false), 50);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials) => {
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            setUser(res.data);
            return { success: true };
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'البريد أو كلمة السر غير صحيحة' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.replace('/fin/login'); // استخدام إعادة تحميل كاملة لتنظيف الذاكرة
    };

    // تحديث بيانات المستخدم في الـ state بعد أي تعديل
    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, updateUser }}>
            {/* عرض المحتوى فقط بعد انتهاء التحميل الأولي لمنع الوميض والاختفاء */}
            {!loading ? children : (
                <div className="flex items-center justify-center h-screen bg-black">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
