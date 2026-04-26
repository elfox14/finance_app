import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, TrendingDown, Clock, 
    ChevronRight, AlertCircle, ShieldCheck,
    ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllStats, setShowAllStats] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/dashboard');
            const data = res.data || {};
            setStats(data);
            setTransactions(Array.isArray(data.recentActions) ? data.recentActions : []);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setStats({});
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getHealthColor = (score) => {
        if (score === undefined || score === null) return 'text-slate-500';
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-blue-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const topStats = stats?.topStats || {};
    const healthFactors = stats?.healthFactors || {};

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20 md:pb-10" dir="rtl">
            <header className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">نظرة عامة</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تحليل شامل لوضعك المالي الحالي</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 px-4 md:px-0">
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
                    <TopStatItem label="الرصيد الحالي" val={topStats.currentBalance || 0} icon={<Wallet />} color="bg-blue-600" />
                    <TopStatItem label="السيولة المتاحة" val={topStats.availableBalance || 0} icon={<TrendingUp />} color="bg-emerald-600" />
                    <TopStatItem label="إجمالي الالتزامات" val={topStats.totalObligations || 0} icon={<Clock />} color="bg-orange-600" />
                    <div className="flex-shrink-0 w-72 md:w-auto bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between group">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الصحة المالية</p>
                            <p className={`text-3xl font-black ${getHealthColor(topStats.healthScore)}`}>
                                {topStats.healthScore !== undefined ? topStats.healthScore : 0}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-slate-800 ${getHealthColor(topStats.healthScore)}`}>
                            <ShieldCheck size={28} />
                        </div>
                    </div>
                </div>

                <button onClick={() => setShowAllStats(!showAllStats)} className="md:hidden flex items-center justify-center gap-2 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-xs font-bold">
                    {showAllStats ? <><ChevronUp size={16} /> إخفاء التفاصيل</> : <><ChevronDown size={16} /> عرض التفاصيل</>}
                </button>

                {(showAllStats || window.innerWidth >= 768) && (
                    <div className="grid grid-cols-2 gap-4 px-4 md:px-0">
                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
                            <p className="text-[10px] text-slate-500 font-bold mb-1">المصاريف المتوقعة</p>
                            <p className="text-lg font-black text-white">{topStats.expectedExpense?.toLocaleString() || 0} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
                            <p className="text-[10px] text-slate-500 font-bold mb-1">الدخل المتوقع</p>
                            <p className="text-lg font-black text-white">{topStats.expectedIncome?.toLocaleString() || 0} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3"><TrendingUp className="text-blue-500" /> تحليل الكفاءة المالية</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex justify-center">
                                <div className="relative w-48 h-48 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className={getHealthColor(topStats.healthScore)} strokeDasharray={552} strokeDashoffset={552 - (552 * (topStats.healthScore || 0)) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute text-center">
                                        <p className={`text-5xl font-black ${getHealthColor(topStats.healthScore)}`}>{topStats.healthScore || 0}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1">نقطة جودة</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <HealthFactor label="نسبة الادخار" percent={healthFactors.savingsRate || 0} />
                                <HealthFactor label="عبء الديون" percent={healthFactors.debtRatio || 0} inverse />
                                <HealthFactor label="تغطية الطوارئ" percent={healthFactors.liquidityScore || 0} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8">آخر العمليات</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
                        {(Array.isArray(transactions) ? transactions : []).map((t, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/30 p-2 rounded-2xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {t.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white truncate max-w-[120px]">{t.category || t.source || 'بدون تصنيف'}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                    {t.type === 'income' ? '+' : '-'}{t.amount?.toLocaleString() || 0}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TopStatItem = ({ label, val, icon, color }) => (
    <div className="flex-shrink-0 w-72 md:w-auto bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>{icon}</div>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{(val || 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
    </div>
);

const HealthFactor = ({ label, percent, inverse }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
            <span className="text-xs font-black text-white">{percent}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${percent > 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default Dashboard;
