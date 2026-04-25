import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            console.error("Auth check failed", err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', credentials);
            const token = res.data.token;
            
            // تخزين التوكن
            localStorage.setItem('token', token);
            
            // التأكد من أن التوكن تم حفظه فعلياً قبل جلب البيانات
            await new Promise(resolve => setTimeout(resolve, 100)); 

            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
            
            return { success: true };
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
            return { success: false, message: err.response?.data?.message || 'بيانات الدخول غير صحيحة' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // استخدام الانتقال الكامل للصفحة لتنظيف الذاكرة
        window.location.replace('/fin/login'); 
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
