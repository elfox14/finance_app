import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            // جلب بيانات المستخدم فوراً بعد الحفظ لضمان مزامنة الحالة
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'خطأ في الدخول' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/fin/login'; // توجيه قسري للمسار الصحيح
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading ? children : (
                <div className="flex items-center justify-center h-screen bg-black">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
