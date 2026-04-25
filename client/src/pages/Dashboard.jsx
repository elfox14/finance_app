import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, TrendingUp, TrendingDown, Clock, 
    ShieldCheck, AlertCircle, Calendar, ArrowUpRight, 
    ArrowDownLeft, Zap, Target, PieChart as PieIcon,
    Activity, ArrowRight
} from 'lucide-react';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, 
    BarElement, Title, Tooltip, Legend, ArcElement 
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard');
            setStats(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const distributionData = {
        labels: Object.keys(stats?.distribution || {}),
        datasets: [{
            data: Object.values(stats?.distribution || {}),
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
            borderWidth: 0,
        }]
    };

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 50) return 'text-blue-500';
        if (score >= 30) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            {/* 🚀 Strategic Top Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl backdrop-blur-md sticky top-0 z-50">
                <div className="text-center border-l border-slate-800 last:border-0">
                    <p className="text-[10px] text-slate-500 font-bold mb-1">الرصيد الحالي</p>
                    <p className="text-sm font-black text-white">{stats?.topStats.currentBalance.toLocaleString()}</p>
                </div>
                <div className="text-center border-l border-slate-800 last:border-0">
                    <p className="text-[10px] text-indigo-400 font-bold mb-1">الرصيد المتاح</p>
                    <p className="text-sm font-black text-white">{stats?.topStats.availableBalance.toLocaleString()}</p>
                </div>
                <div className="text-center border-l border-slate-800 last:border-0">
                    <p className="text-[10px] text-red-400 font-bold mb-1">التزامات 30 يوم</p>
                    <p className="text-sm font-black text-white">{stats?.topStats.total30DayObligations.toLocaleString()}</p>
                </div>
                <div className="text-center border-l border-slate-800 last:border-0">
                    <p className="text-[10px] text-emerald-400 font-bold mb-1">الدخل المتوقع</p>
                    <p className="text-sm font-black text-white">{stats?.topStats.expectedIncome.toLocaleString()}</p>
                </div>
                <div className="text-center border-l border-slate-800 last:border-0">
                    <p className="text-[10px] text-orange-400 font-bold mb-1">المصروف المتوقع</p>
                    <p className="text-sm font-black text-white">{stats?.topStats.expectedExpense.toLocaleString()}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 font-bold mb-1">مؤشر الصحة المالية</p>
                    <div className={`flex items-center justify-center gap-1 font-black text-sm ${getHealthColor(stats?.topStats.healthScore)}`}>
                        <Activity size={14} /> {stats?.topStats.healthScore}%
                    </div>
                </div>
            </div>

            <header>
                <h1 className="text-3xl font-black text-white">لوحة القيادة الذكية</h1>
                <p className="text-slate-500 text-sm mt-1">تحليل شامل للتدفقات النقدية والالتزامات</p>
            </header>

            {/* Main Indicators Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Gauge Card */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                            <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className={getHealthColor(stats?.topStats.healthScore)} strokeDasharray={502} strokeDashoffset={502 - (502 * stats?.topStats.healthScore) / 100} strokeLinecap="round" />
                        </svg>
                        <div className="absolute">
                            <p className={`text-5xl font-black ${getHealthColor(stats?.topStats.healthScore)}`}>{stats?.topStats.healthScore}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">درجة الأمان</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-white font-bold">وضعك المالي حالياً {stats?.topStats.healthScore > 70 ? 'ممتاز' : stats?.topStats.healthScore > 40 ? 'مستقر' : 'يحتاج انتباه'}</p>
                        <p className="text-xs text-slate-500 mt-2">مبني على الالتزامات، الادخار، والتأخيرات</p>
                    </div>
                </div>

                {/* Indicators List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><TrendingUp size={24} /></div>
                            <span className="text-xs text-slate-500 font-bold">SAVINGS</span>
                        </div>
                        <p className="text-slate-500 text-xs mb-1">معدل الادخار الفعلي</p>
                        <p className="text-3xl font-black text-white">{stats?.indicators.savingsRate}%</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><AlertCircle size={24} /></div>
                            <span className="text-xs text-slate-500 font-bold">DEBT BURDEN</span>
                        </div>
                        <p className="text-slate-500 text-xs mb-1">نسبة الالتزام للدخل</p>
                        <p className="text-3xl font-black text-white">{stats?.indicators.debtToIncomeRatio}%</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl col-span-1 md:col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${stats?.indicators.hasOverdue ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">{stats?.indicators.hasOverdue ? 'تنبيه: توجد متأخرات سداد' : 'سجل سداد نظيف'}</h4>
                                <p className="text-xs text-slate-500 mt-1">{stats?.indicators.hasOverdue ? 'يرجى مراجعة قسم السلف والقروض فوراً' : 'أنت ملتزم تماماً بمواعيد السداد'}</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-700" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expense Chart */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl h-80">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieIcon size={20} className="text-blue-500" /> توزيع المصروفات
                    </h3>
                    <div className="h-48 flex justify-center">
                        <Pie data={distributionData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#64748b' } } } }} />
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">آخر النشاطات</h3>
                    <div className="space-y-4">
                        {stats?.recentActions.map((action, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-2xl">
                                <span className="text-sm font-bold text-white">{action.source || action.note}</span>
                                <span className={`font-black ${action.source ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {action.source ? '+' : '-'}{action.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
