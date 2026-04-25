import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await api.post('/auth/rescue-reset', { email, newPassword });
            setStatus({ type: 'success', message: res.data.message });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'حدث خطأ أثناء التغيير' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl scale-in" dir="rtl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white text-center">إعادة تعيين كلمة السر</h2>
                    <p className="text-center text-slate-500 mt-2 text-sm font-medium">أدخل بريدك وكلمة السر الجديدة للاستمرار</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {status.message && (
                        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                            {status.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                            {status.message}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 mr-2 font-bold uppercase tracking-widest">البريد الإلكتروني</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
                            placeholder="example@mail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-500 mr-2 font-bold uppercase tracking-widest">كلمة السر الجديدة</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-white transition-all mt-4 shadow-lg flex items-center justify-center gap-2 ${
                            loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'تحديث كلمة السر'}
                    </button>
                </form>

                <div className="text-center mt-8">
                    <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-white transition-colors text-sm">
                        <ArrowRight size={18}/> العودة لتسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
