import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, LogIn, UserPlus, Eye, EyeOff, HelpCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        
        setError('');
        setLoading(true);
        
        try {
            const result = await login({ email, password });
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
                setLoading(false);
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 scale-in" dir="rtl">
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
                            autoComplete="email"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1 px-2">
                            <label className="text-xs text-slate-500 font-bold uppercase">كلمة السر</label>
                            <Link to="/reset-password" size={14} className="text-[10px] text-blue-500 hover:underline font-bold flex items-center gap-1">
                                <HelpCircle size={12}/> نسيت كلمة السر؟
                            </Link>
                        </div>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all pl-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-white transition-all mt-4 shadow-lg flex items-center justify-center gap-2 ${
                            loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                        }`}
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
        </div>
    );
};

export default Login;
