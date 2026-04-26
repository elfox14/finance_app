import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, TrendingDown, Clock, 
    AlertCircle, ShieldCheck,
    Plus, PieChart as PieIcon, History, Bell,
    Sparkles, Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    Chart as ChartJS, ArcElement, Tooltip, Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard');
            setStats(res.data || {});
        } catch (err) { 
            console.error('🔥 Dashboard Sync Error:', err);
            setStats({});
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const { topStats = {}, indicators = {}, executiveSummary = {}, alerts = [], recentActions = [], upcomingObligations = [], distribution = {} } = stats || {};

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-blue-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const chartData = {
        labels: Object.keys(distribution).length > 0 ? Object.keys(distribution) : ['بانتظار البيانات'],
        datasets: [{
            data: Object.values(distribution).length > 0 ? Object.values(distribution) : [1],
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'],
            borderColor: '#0f172a',
            borderWidth: 4,
            hoverOffset: 20
        }]
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between gap-6 px-4 md:px-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">قمرة القيادة</h1>
                        <span className="bg-blue-600/10 text-blue-500 text-[10px] px-2 py-1 rounded-md font-bold border border-blue-500/20">Executive v3.5</span>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">نظام التحليل المالي الذكي (جيبي الذكاء الاصطناعي)</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/expenses" className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-900/40 hover:scale-105 transition-all">
                        <Plus size={24} />
                    </Link>
                </div>
            </header>

            {/* Alerts Section (New Axis 6) */}
            {alerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
                    {alerts.map((alert, i) => (
                        <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${
                            alert.type === 'danger' ? 'bg-red-500/5 border-red-500/20 text-red-500' : 
                            alert.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' : 
                            'bg-blue-500/5 border-blue-500/20 text-blue-500'
                        }`}>
                            <AlertCircle size={18} />
                            <p className="text-xs font-black">{alert.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                <StatCard label="السيولة الحالية" val={topStats.currentBalance} icon={<Wallet />} color="bg-blue-600" />
                <StatCard label="التزامات الـ 30 يوم" val={topStats.total30DayObligations} icon={<Clock />} color="bg-red-600" />
                <StatCard label="دخل هذا الشهر" val={topStats.expectedIncome} icon={<TrendingUp />} color="bg-emerald-600" />
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div>
                        <p className="text-[10px] text-slate-500 font-black mb-1 uppercase">نقاط القوة</p>
                        <p className={`text-3xl font-black ${getHealthColor(topStats.healthScore)}`}>{topStats.healthScore?.toFixed(0) || 0}%</p>
                    </div>
                    <ShieldCheck size={32} className={getHealthColor(topStats.healthScore)} />
                </div>
            </div>

            {/* Executive Summary (New Axis 6) */}
            <div className="mx-4 md:mx-0 p-8 bg-blue-600/10 border border-blue-500/20 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                    <Sparkles size={120} className="text-blue-500" />
                </div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-black text-blue-400 flex items-center gap-2">
                        <Lightbulb size={24} /> رؤية "جيبي" التحليلية
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <p className="text-white text-lg font-black leading-relaxed">{executiveSummary.text}</p>
                            <p className="text-blue-500 text-sm mt-2 font-bold italic">{executiveSummary.mainInsight}</p>
                        </div>
                        <div className="flex gap-4 items-center justify-start lg:justify-end">
                            <IndicatorMini label="معدل الادخار" val={indicators.savingsRate} />
                            <IndicatorMini label="عبء الديون" val={indicators.debtToIncomeRatio} />
                            <IndicatorMini label="استهلاك البطاقة" val={indicators.cardUsageRatio} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis & History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2"><History size={20} className="text-blue-500" /> سجل العمليات الأخير</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
                        {recentActions.map((action, i) => (
                            <div key={i} className="flex justify-between items-center p-5 bg-slate-800/20 rounded-2xl border border-transparent hover:border-slate-800 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {action.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white truncate max-w-[120px]">{action.displayLabel}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(action.date).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className={`text-sm font-black ${action.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {action.type === 'income' ? '+' : '-'}{action.amount?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Obligations */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2"><Clock className="text-orange-500" /> استحقاقات قادمة</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] no-scrollbar px-2">
                        {upcomingObligations.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        item.category === 'loan' ? 'bg-orange-500/10 text-orange-500' : 
                                        item.category === 'card' ? 'bg-blue-500/10 text-blue-500' : 
                                        'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                        {item.category === 'loan' ? <Landmark size={16} /> : 
                                         item.category === 'card' ? <CreditCard size={16} /> : 
                                         <Users size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">{item.name}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">
                                            {item.date ? new Date(item.date).toLocaleDateString('ar-EG') : 'الشهر الحالي'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-white">{item.amount?.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, val, icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-blue-500/30 transition-all">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-900/10`}>
            {icon}
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{(val || 0).toLocaleString()} <span className="text-xs opacity-50 font-normal">ج.م</span></p>
    </div>
);

const IndicatorMini = ({ label, val }) => (
    <div className="text-left bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-800 min-w-[100px]">
        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{label}</p>
        <p className="text-sm font-black text-white">{val || 0}%</p>
    </div>
);

const AlertCircle = ({ size, className }) => <Clock size={size} className={className} />;

export default Dashboard;
