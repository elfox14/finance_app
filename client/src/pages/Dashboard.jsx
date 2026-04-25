import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingDown, Landmark, PiggyBank, History, Lock, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) {
                setStats({
                    currentBalance: 0,
                    totalLoanRemaining: 0,
                    totalCertValue: 0,
                    totalExpense: 0,
                    recentTransactions: []
                });
                return;
            }

            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Dashboard Fetch Error:', err);
                setError('تعذر الاتصال بالسيرفر حالياً');
            }
        };
        fetchStats();
    }, [user]);

    if (error) return <div className="text-red-500 text-center p-20 font-bold">{error}</div>;
    
    if (!stats) return (
        <div className="flex items-center justify-center h-screen bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="fade-in space-y-10 p-4 md:p-0">
            {/* Guest Banner */}
            {!user && (
                <div className="bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">أهلاً بك في محفظتي الذكية ✨</h2>
                        <p className="text-slate-400">سجل دخولك الآن لتبدأ إدارة أموالك باحترافية وتأمين بياناتك.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40">دخول</Link>
                        <Link to="/register" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl font-bold transition-all">إنشاء حساب</Link>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="الرصيد المتاح" value={stats.currentBalance} color="emerald" icon={<Wallet />} />
                <StatCard title="إجمالي الديون" value={stats.totalLoanRemaining} color="red" icon={<Landmark />} />
                <StatCard title="قيمة الشهادات" value={stats.totalCertValue} color="blue" icon={<PiggyBank />} />
                <StatCard title="مصروفات الشهر" value={stats.totalExpense} color="orange" icon={<TrendingDown />} />
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <History className="text-blue-500" /> آخر العمليات
                        </h3>
                        {user && <Link to="/expenses" className="text-blue-500 text-sm hover:underline">عرض الكل</Link>}
                    </div>
                    
                    <div className="space-y-4">
                        {stats.recentTransactions?.length > 0 ? (
                            stats.recentTransactions.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-slate-800/30 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{t.note || t.source || t.personName || 'عملية مالية'}</div>
                                            <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('ar-EG')}</div>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()} ج.م
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-600 italic">لا توجد عمليات مسجلة لعرضها.</div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/30">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <Lock className="mb-6 opacity-50" size={40} />
                    <h4 className="text-2xl font-bold mb-4 leading-tight">أموالك في أمان تام مع نظامنا الذكي</h4>
                    <p className="text-blue-100 text-sm leading-relaxed mb-8">نستخدم أحدث تقنيات التشفير لضمان أن بياناتك المالية تظل ملكاً لك وحدك.</p>
                    {!user && <Link to="/register" className="block w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-center hover:bg-blue-50 transition-colors shadow-lg">اشترك الآن مجاناً</Link>}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => {
    const colorStyles = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colorStyles[color]}`}>
                {icon}
            </div>
            <p className="text-slate-400 text-sm mb-1 font-medium">{title}</p>
            <p className="text-2xl font-black text-white">
                {Number(value || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </p>
        </div>
    );
};

export default Dashboard;
