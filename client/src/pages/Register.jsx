import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register({ name, email, password });
            navigate('/');
        } catch (err) {
            alert('خطأ في إنشاء الحساب، ربما البريد مستخدم بالفعل');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4" dir="rtl">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-black text-white text-center mb-6">جيبي 💰</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="الاسم بالكامل"
                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                        placeholder="كلمة السر (6 أحرف على الأقل)"
                        className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors mt-4">
                        إنشاء الحساب
                    </button>
                </form>
                <p className="text-center text-slate-400 mt-6">
                    لديك حساب بالفعل؟ <Link to="/login" className="text-blue-500 hover:underline">سجل دخولك هنا</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
