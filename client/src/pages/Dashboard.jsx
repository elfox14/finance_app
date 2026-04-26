import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, TrendingDown, Clock, 
    ChevronRight, AlertCircle, ShieldCheck,
    Plus, PieChart as PieIcon, Target, 
    ArrowRightCircle, CheckCircle2, Bell
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
            // الاستجابة الموحدة الآن تحتوي على: topStats, indicators, distribution, recentActions, upcomingObligations
            setStats(res.data || {});
        } catch (err) { 
            console.error('🔥 Frontend Dashboard Error:', err);
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

    // استخراج البيانات بناءً على التعاقد الموحد الجديد
    const topStats = stats?.topStats || {};
    const indicators = stats?.indicators || {};
    const distribution = stats?.distribution || {};
    const recentActions = stats?.recentActions || [];
    const upcoming = stats?.upcomingObligations || [];

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
                        <span className="bg-blue-600/10 text-blue-500 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest border border-blue-500/20">Unified v3.0</span>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">نظامك المالي متصل وموحد الآن بنسبة 100%</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/notifications" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative group">
                        <Bell className="text-slate-400 group-hover:text-blue-500 transition-colors" size={24} />
                        {indicators.hasOverdue && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
                    </Link>
                    <Link to="/expenses" className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/40 hover:scale-105 transition-all">
                        <Plus size={24} />
                    </Link>
                </div>
            </header>

            {/* Top Stats - المحاور الثلاثة الأولى */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                <StatCard label="الرصيد المتاح حالياً" val={topStats.currentBalance} icon={<Wallet />} color="bg-blue-600" />
                <StatCard label="التزامات الـ 30 يوم" val={topStats.total30DayObligations} icon={<Clock />} color="bg-red-600" />
                <StatCard label="الدخل المتوقع" val={topStats.expectedIncome} icon={<TrendingUp />} color="bg-emerald-600" />
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div>
                        <p className="text-[10px] text-slate-500 font-black mb-1 uppercase tracking-widest">مؤشر جودة المال</p>
                        <p className={`text-3xl font-black ${getHealthColor(topStats.healthScore)}`}>{topStats.healthScore || 0}%</p>
                    </div>
                    <ShieldCheck size={32} className={getHealthColor(topStats.healthScore)} />
                </div>
            </div>

            {/* التحليل المالي ومركز الاستحقاقات */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white flex items-center gap-3"><PieIcon className="text-blue-500" /> المحور الخامس: التحليل</h3>
                        <div className="flex gap-4">
                            <IndicatorMini label="الادخار" val={indicators.savingsRate} />
                            <IndicatorMini label="الديون" val={indicators.debtToIncomeRatio} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="h-64 relative">
                            <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' }, usePointStyle: true } } } }} />
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-800/50 rounded-[2rem] border border-slate-800">
                                <p className="text-xs text-slate-500 font-bold mb-4 uppercase">تحليل السيولة المتبقية</p>
                                <p className={`text-4xl font-black ${topStats.availableBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {topStats.availableBalance?.toLocaleString() || 0} <span className="text-sm font-normal opacity-50">ج.م</span>
                                </p>
                                <p className="text-[10px] text-slate-600 mt-2 font-medium">المبلغ المتبقي بعد خصم كافة التزامات الشهر</p>
                            </div>
                            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem]">
                                <p className="text-[10px] text-blue-400 font-black uppercase mb-2">رؤية "جيبي" الذكية</p>
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    {indicators.savingsRate > 20 ? "أداء ممتاز! ننصح بتحويل جزء من الفائض لشهادة استثمار." : "نلاحظ زيادة في المصاريف المتغيرة، حاول ضبط موازنة الطعام هذا الأسبوع."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* استحقاقات حقيقية من السيرفر */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2"><Clock className="text-orange-500" /> استحقاقات قادمة</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] no-scrollbar px-2">
                        {upcoming.length > 0 ? upcoming.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                                <div>
                                    <p className="text-xs font-black text-white">{item.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{item.type === 'loan' ? 'قرض بنكي' : 'قسط جمعية'}</p>
                                </div>
                                <p className="text-sm font-black text-orange-500">{item.amount?.toLocaleString()}</p>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 italic text-xs">لا يوجد التزامات مجدولة</div>
                        )}
                    </div>
                    <Link to="/loans" className="mt-8 py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] text-center transition-all uppercase tracking-widest">إدارة الديون الكاملة</Link>
                </div>
            </div>

            {/* آخر العمليات */}
            <div className="mx-4 md:mx-0 p-8 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2"><History size={20} className="text-blue-500" /> آخر التحركات المالية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentActions.map((action, i) => (
                        <div key={i} className="flex justify-between items-center p-5 bg-slate-800/20 rounded-2xl border border-transparent hover:border-slate-800 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-500">
                                    <ArrowUpRight size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{action.category}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(action.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                            <p className="text-sm font-black text-white">{action.amount?.toLocaleString()}</p>
                        </div>
                    ))}
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
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-tighter">{label}</p>
        <p className="text-2xl font-black text-white">{(val || 0).toLocaleString()} <span className="text-xs opacity-50 font-normal">ج.م</span></p>
    </div>
);

const IndicatorMini = ({ label, val }) => (
    <div className="text-left bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-800">
        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{label}</p>
        <p className="text-sm font-black text-white">{val || 0}%</p>
    </div>
);

const History = ({ size, className }) => <Clock size={size} className={className} />;

export default Dashboard;
