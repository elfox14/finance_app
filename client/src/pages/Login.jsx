import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            alert('خطأ في تسجيل الدخول');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6" dir="rtl">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl z-10">
                <h2 className="text-3xl font-bold text-white text-center mb-8">تسجيل الدخول</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 mb-2 font-medium">البريد الإلكتروني</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2 font-medium">كلمة السر</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20">
                        دخول
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
