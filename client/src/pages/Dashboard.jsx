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
            const [statsRes, transRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/expenses/latest')
            ]);
            setStats(statsRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getHealthColor = (score) => {
        if (!score && score !== 0) return 'text-slate-500';
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

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20 md:pb-10" dir="rtl">
            {/* Header Section */}
            <header className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">نظرة عامة</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تحليل شامل لوضعك المالي الحالي</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/expenses" className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform">
                        <Plus size={20} />
                    </Link>
                </div>
            </header>

            {/* Strategic Top Bar - Optimized for Mobile with Safe Access */}
            <div className="grid grid-cols-1 gap-6 px-4 md:px-0">
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
                    <TopStatItem 
                        label="الرصيد الحالي" 
                        val={stats?.topStats?.currentBalance || 0} 
                        icon={<Wallet />} 
                        color="bg-blue-600" 
                        trend="+2.4%"
                    />
                    <TopStatItem 
                        label="السيولة المتاحة" 
                        val={stats?.topStats?.availableBalance || 0} 
                        icon={<TrendingUp />} 
                        color="bg-emerald-600" 
                    />
                    <TopStatItem 
                        label="إجمالي الالتزامات" 
                        val={stats?.topStats?.totalObligations || 0} 
                        icon={<Clock />} 
                        color="bg-orange-600" 
                    />
                    <div className="flex-shrink-0 w-72 md:w-auto bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between group">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">الصحة المالية</p>
                            <p className={`text-3xl font-black transition-colors ${getHealthColor(stats?.topStats?.healthScore)}`}>
                                {stats?.topStats?.healthScore || 0}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-slate-800 transition-colors ${getHealthColor(stats?.topStats?.healthScore)}`}>
                            <ShieldCheck size={28} />
                        </div>
                    </div>
                </div>

                {/* Mobile Toggle for More Insights */}
                <button 
                    onClick={() => setShowAllStats(!showAllStats)}
                    className="md:hidden flex items-center justify-center gap-2 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-xs font-bold"
                >
                    {showAllStats ? <><ChevronUp size={16} /> إخفاء التفاصيل</> : <><ChevronDown size={16} /> عرض تفاصيل الدخل والمصاريف</>}
                </button>

                {(showAllStats || window.innerWidth >= 768) && (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300 px-4 md:px-0">
                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
                            <p className="text-[10px] text-slate-500 font-bold mb-1">المصاريف المتوقعة</p>
                            <p className="text-lg font-black text-white">{stats?.topStats?.expectedExpense?.toLocaleString() || 0} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
                            <p className="text-[10px] text-slate-500 font-bold mb-1">الدخل المتوقع</p>
                            <p className="text-lg font-black text-white">{stats?.topStats?.expectedIncome?.toLocaleString() || 0} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Financial Health Deep Dive */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                                <TrendingUp className="text-blue-500" /> تحليل الكفاءة المالية
                            </h3>
                            <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-full uppercase tracking-widest">تحديث لحظي</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex justify-center">
                                <div className="relative w-48 h-48 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className={getHealthColor(stats?.topStats?.healthScore)} strokeDasharray={552} strokeDashoffset={552 - (552 * (stats?.topStats?.healthScore || 0)) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute text-center">
                                        <p className={`text-5xl font-black ${getHealthColor(stats?.topStats?.healthScore)}`}>{stats?.topStats?.healthScore || 0}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">نقطة جودة</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <HealthFactor label="نسبة الادخار" percent={stats?.healthFactors?.savingsRate || 0} />
                                <HealthFactor label="عبء الديون" percent={stats?.healthFactors?.debtRatio || 0} inverse />
                                <HealthFactor label="تغطية الطوارئ" percent={stats?.healthFactors?.liquidityScore || 0} />
                                <p className="text-xs text-slate-500 leading-relaxed mt-6 italic">
                                    "صحتك المالية جيدة جداً، ننصح بزيادة الاستثمار في الشهادات لرفع العائد الشهري بمقدار 12%."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity - Simplified for Mobile */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8">آخر العمليات</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-20">
                                <Clock size={48} className="mb-4" />
                                <p className="text-sm font-bold">لا توجد عمليات مؤخراً</p>
                            </div>
                        ) : (
                            transactions.map((t, i) => (
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
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                    <Link to="/expenses" className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all">
                        مشاهدة الكل <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const TopStatItem = ({ label, val, icon, color, trend }) => (
    <div className="flex-shrink-0 w-72 md:w-auto bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl group hover:border-blue-500/30 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            {trend && (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    {trend}
                </span>
            )}
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white">
            {val?.toLocaleString() || 0} <span className="text-xs font-normal opacity-50">ج.م</span>
        </p>
    </div>
);

const HealthFactor = ({ label, percent, inverse }) => {
    const getColor = (p) => {
        const val = inverse ? 100 - p : p;
        if (val >= 80) return 'bg-emerald-500';
        if (val >= 60) return 'bg-blue-500';
        if (val >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                <span className="text-xs font-black text-white">{percent}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${getColor(percent)}`} 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};

export default Dashboard;
