import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, TrendingDown, Clock, 
    ChevronRight, AlertCircle, ShieldCheck,
    ChevronDown, ChevronUp, Plus, Sparkles,
    Calendar, AlertTriangle, Info, ArrowRight,
    PieChart, Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const executiveSummary = stats?.executiveSummary || {};
    const alerts = stats?.alerts || [];
    const healthFactors = stats?.healthFactors || {};
    const upcoming = stats?.upcomingObligations || [];

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20 md:pb-10" dir="rtl">
            {/* 1) Quick Actions & Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">لوحة التحكم</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">ذكاء مالي في متناول يدك</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <QuickActionButton to="/incomes" icon={<Plus size={16} />} label="دخل جديد" color="bg-emerald-600" />
                    <QuickActionButton to="/expenses" icon={<Plus size={16} />} label="مصروف جديد" color="bg-red-600" />
                    <QuickActionButton to="/loans" icon={<Receipt size={16} />} label="دفع قسط" color="bg-blue-600" />
                </div>
            </header>

            {/* 2) Decision Bar (Top Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
                <DecisionItem label="الرصيد الحالي" val={topStats.currentBalance} icon={<Wallet size={20} />} color="blue" />
                <DecisionItem label="المتاح للإنفاق" val={topStats.availableBalance} icon={<TrendingUp size={20} />} color="emerald" sub="بعد الالتزامات" />
                <DecisionItem label="التزامات 30 يوم" val={topStats.totalObligations} icon={<Clock size={20} />} color="orange" />
                <DecisionItem label="نسبة الادخار" val={`${topStats.savingsRate}%`} icon={<TrendingDown size={20} />} color="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 space-y-8">
                    {/* 3) Executive Summary */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40 shrink-0">
                                <Sparkles size={32} />
                            </div>
                            <div className="text-center md:text-right">
                                <h3 className="text-xl font-black text-white mb-2">الملخص التنفيذي</h3>
                                <p className="text-blue-100 text-sm md:text-base leading-relaxed opacity-90">{executiveSummary.text}</p>
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 rounded-xl text-xs font-bold text-blue-200">
                                    <Info size={14} /> {executiveSummary.mainInsight}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4) Needs Attention & Health Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                <AlertCircle className="text-orange-500" /> ما يحتاج انتباهك
                            </h3>
                            <div className="space-y-4">
                                {alerts.length > 0 ? alerts.map((alert, i) => (
                                    <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 ${alert.type === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        {alert.type === 'danger' ? <AlertTriangle size={20} /> : <Info size={20} />}
                                        <p className="text-xs font-bold">{alert.message}</p>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-600">
                                        <ShieldCheck size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-xs">لا توجد تنبيهات عاجلة، وضعك المالي ممتاز</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                    <ShieldCheck className="text-blue-500" /> تحليل الصحة المالية
                                </h3>
                                <div className="space-y-5">
                                    {Object.values(healthFactors).map((factor, i) => (
                                        <HealthIndicator key={i} label={factor.label} score={factor.score} />
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                                <span className="text-slate-500 text-xs font-bold uppercase">المؤشر العام</span>
                                <span className={`text-4xl font-black ${getHealthColor(topStats.healthScore)}`}>{topStats.healthScore}%</span>
                            </div>
                        </div>
                    </div>

                    {/* 5) Upcoming Obligations */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white">الالتزامات القادمة</h3>
                            <Link to="/reports" className="text-blue-500 text-xs font-bold flex items-center gap-1">عرض الكل <ArrowRight size={14} /></Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upcoming.length > 0 ? upcoming.map((item, i) => (
                                <div key={i} className="bg-slate-800/40 p-5 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{item.name}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-white">{item.amount?.toLocaleString()} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                                </div>
                            )) : (
                                <p className="col-span-2 text-center text-slate-600 py-10 text-sm">لا توجد التزامات قادمة حالياً</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* 6) Spending Distribution (Pie) */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3"><PieChart className="text-indigo-500" /> تحليل الإنفاق</h3>
                        {/* Placeholder for Pie Chart Logic */}
                        <div className="aspect-square flex items-center justify-center bg-slate-800/50 rounded-full border-8 border-slate-800 relative">
                            <div className="text-center">
                                <p className="text-3xl font-black text-white italic">Geybi</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Analytics</p>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                             {Object.entries(stats?.distribution || {}).slice(0, 4).map(([cat, val], i) => (
                                 <div key={i} className="flex justify-between items-center px-2">
                                     <span className="text-xs text-slate-400 font-bold">{cat}</span>
                                     <span className="text-xs text-white font-black">{val.toLocaleString()} ج.م</span>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* 7) Latest Actions */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
                        <h3 className="text-lg font-black text-white mb-8">أحدث الحركات</h3>
                        <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
                            {transactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/30 p-2 rounded-2xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white truncate max-w-[120px]">{t.category || t.budgetCategory || t.source || 'بدون تصنيف'}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount?.toLocaleString() || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Link to="/reports" className="mt-8 py-4 bg-slate-800 rounded-2xl text-center text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all">عرض سجل الحركات بالكامل</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DecisionItem = ({ label, val, icon, color, sub }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl hover:border-slate-700 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 shadow-inner group-hover:scale-110 transition-transform`}>{icon}</div>
        </div>
        <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{(val || 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
            {sub && <p className="text-[10px] text-emerald-500 font-bold mt-1 italic">{sub}</p>}
        </div>
    </div>
);

const HealthIndicator = ({ label, score }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
            <span className="text-xs font-black text-white">{score}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
        </div>
    </div>
);

const QuickActionButton = ({ to, icon, label, color }) => (
    <Link to={to} className={`flex items-center gap-2 px-4 py-2.5 ${color} text-white rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all`}>
        {icon} <span>{label}</span>
    </Link>
);

export default Dashboard;
