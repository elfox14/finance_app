import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, Clock, 
    AlertCircle, ShieldCheck,
    Plus, PieChart as PieIcon, 
    Sparkles, Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

    const { 
        topStats = {}, 
        budgets = [], 
        indicators = {}, 
        upcomingObligations = [], 
        insights = [] 
    } = stats || {};

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-blue-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between gap-6 px-4 md:px-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">قمرة القيادة</h1>
                        <span className="bg-blue-600/10 text-blue-500 text-[10px] px-2 py-1 rounded-md font-bold border border-blue-500/20">Financial Engine v4.0</span>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">نظام الرقابة المالية الشخصية الموحد</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/expenses" className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-900/40 hover:scale-105 transition-all flex items-center justify-center">
                        <Plus size={24} />
                    </Link>
                </div>
            </header>

            <div className="px-4 md:px-0 space-y-8">
                {/* Layer 1: Quick Financial Summary */}
                <section className="space-y-4">
                    <h2 className="text-slate-500 font-bold text-sm tracking-wider uppercase">الملخص المالي السريع</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="الرصيد الحالي" val={topStats.currentBalance} icon={<Wallet size={20} />} color="bg-blue-600" />
                        <StatCard label="الرصيد المتاح" val={topStats.availableBalance} icon={<ShieldCheck size={20} />} color="bg-indigo-600" />
                        <StatCard label="التزامات 30 يوم" val={topStats.next30DayObligations} icon={<ArrowDownLeft size={20} />} color="bg-red-600" />
                        <StatCard label="حقوق 30 يوم" val={topStats.next30DayReceivables} icon={<ArrowUpRight size={20} />} color="bg-emerald-600" />
                        <StatCard label="صافي التدفق المتوقع" val={topStats.expectedNetFlow} icon={<TrendingUp size={20} />} color="bg-slate-600" />
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center shadow-xl">
                            <p className="text-[10px] text-slate-500 font-black mb-1 uppercase">مؤشر الصحة المالية</p>
                            <p className={`text-3xl font-black ${getHealthColor(topStats.healthScore)}`}>{topStats.healthScore}%</p>
                        </div>
                    </div>
                </section>

                {/* Layer 2: Budgets & Expenses */}
                <section className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl space-y-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-2"><PieIcon className="text-blue-500" /> الميزانية والمصروفات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {budgets.length > 0 ? budgets.map((b, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-white">{b.category}</span>
                                    <span className={b.percent > 100 ? 'text-red-500' : 'text-slate-400'}>{b.percent}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${b.percent > 100 ? 'bg-red-500' : b.percent > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${Math.min(b.percent, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                    <span>المتبقي: {(b.remaining).toLocaleString()} ج.م</span>
                                    {b.percent > 100 && <span className="text-red-500">متجاوز</span>}
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 col-span-full text-center py-4">لم يتم إعداد موازنات لهذا الشهر بعد.</p>
                        )}
                    </div>
                </section>

                {/* Layer 3: Financial Analysis */}
                <section className="space-y-4">
                    <h2 className="text-slate-500 font-bold text-sm tracking-wider uppercase">التحليل المالي والمؤشرات</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <IndicatorCard label="معدل الادخار" val={indicators.savingsRate} suffix="%" />
                        <IndicatorCard label="نسبة الالتزامات للدخل" val={indicators.debtToIncomeRatio} suffix="%" />
                        <IndicatorCard label="استخدام البطاقات" val={indicators.cardUtilization} suffix="%" />
                        <IndicatorCard label="تغطية السيولة" val={indicators.liquidityCoverageMonths} suffix=" شهر" />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Layer 4: Upcoming Obligations */}
                    <section className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Clock className="text-orange-500" /> أهم الاستحقاقات القادمة</h3>
                        <div className="space-y-4">
                            {upcomingObligations.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            item.type === 'loan' ? 'bg-orange-500/10 text-orange-500' : 
                                            item.type === 'card' ? 'bg-blue-500/10 text-blue-500' : 
                                            item.type === 'group' ? 'bg-purple-500/10 text-purple-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                            {item.type === 'loan' ? <Landmark size={18} /> : 
                                             item.type === 'card' ? <CreditCard size={18} /> : 
                                             item.type === 'group' ? <Users size={18} /> : <Wallet size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                {new Date(item.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-lg font-black text-white">{item.amount?.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500">ج.م</p>
                                    </div>
                                </div>
                            ))}
                            {upcomingObligations.length === 0 && <p className="text-sm text-slate-500 text-center py-8">لا توجد التزامات قريبة مستحقة</p>}
                        </div>
                    </section>

                    {/* Layer 5: Alerts & Decisions */}
                    <section className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[3rem] relative overflow-hidden group flex flex-col">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                            <Sparkles size={120} className="text-blue-500" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <h3 className="text-xl font-black text-blue-400 flex items-center gap-2 mb-6">
                                <Lightbulb size={24} /> التنبيهات والقرارات الذكية
                            </h3>
                            <div className="space-y-4 flex-1">
                                {insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-slate-900/60 p-5 rounded-2xl border border-blue-500/10 hover:bg-slate-900/80 transition-all">
                                        <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-200 font-bold leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                                {insights.length === 0 && (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-slate-500 text-center">لا توجد تنبيهات هامة حالياً، وضعك المالي مستقر.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, val, icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-5 lg:p-6 rounded-3xl shadow-xl hover:border-blue-500/30 transition-all flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{label}</p>
            <p className="text-xl lg:text-2xl font-black text-white truncate" title={(val || 0).toLocaleString()}>{(val || 0).toLocaleString()}</p>
        </div>
    </div>
);

const IndicatorCard = ({ label, val, suffix }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-md">
        <p className="text-[10px] text-slate-500 font-black uppercase mb-2">{label}</p>
        <p className={`text-xl lg:text-2xl font-black ${
            (val > 80 && label.includes('استخدام')) || (val > 50 && label.includes('التزامات')) ? 'text-red-500' : 
            (val > 15 && label.includes('ادخار')) ? 'text-emerald-500' : 
            'text-white'
        }`}>
            {val}{suffix}
        </p>
    </div>
);

export default Dashboard;
