import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            alert('خطأ في تسجيل الدخول، يرجى التأكد من البيانات');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl" dir="rtl">
                <h2 className="text-3xl font-black text-white text-center mb-2">جيبي 💰</h2>
                <p className="text-center text-slate-400 mb-8">نظامك المالي الذكي في جيبك</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="البريد الإلكتروني"
                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="كلمة السر"
                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4">
                        دخول
                    </button>
                </form>
                <p className="text-center text-slate-400 mt-6">
                    ليس لديك حساب؟ <Link to="/register" className="text-blue-500 hover:underline">أنشئ حساباً جديداً هنا</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
