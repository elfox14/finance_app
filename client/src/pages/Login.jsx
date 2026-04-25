import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const result = await login({ email, password });
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10" dir="rtl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 mb-4">
                        <Wallet className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white text-center">جيبي <span className="text-blue-500">Geybi</span></h2>
                    <p className="text-center text-slate-500 mt-2 text-sm font-medium">مرحباً بك في نظامك المالي الذكي</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl text-center font-bold">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 mr-2 font-bold uppercase">البريد الإلكتروني</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 mr-2 font-bold uppercase">كلمة السر</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all mt-4 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>دخول <LogIn size={20}/></>
                        )}
                    </button>
                </form>

                <div className="text-center mt-8 space-y-3">
                    <p className="text-slate-500 text-sm">
                        ليس لديك حساب؟
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-2 text-blue-500 font-bold hover:text-blue-400 transition-colors">
                        إنشاء حساب جديد <UserPlus size={18}/>
                    </Link>
                </div>
            </div>
            
            <p className="text-slate-600 text-[10px] mt-8 font-bold uppercase tracking-widest">Geybi Financial System v2.0</p>
        </div>
    );
};

export default Login;
