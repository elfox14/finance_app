import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, TrendingUp, TrendingDown, Clock, 
    ShieldCheck, AlertCircle, Calendar, ArrowUpRight, 
    ArrowDownLeft, Zap, Target, PieChart as PieIcon,
    Activity, ArrowRight, ChevronDown
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
    const [showMoreIndicators, setShowMoreIndicators] = useState(false);

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

    const TopStatItem = ({ label, val, colorClass, hideOnMobile = false }) => (
        <div className={`flex-shrink-0 w-32 md:w-auto md:flex-1 text-center border-l border-slate-800 last:border-0 px-2 ${hideOnMobile ? 'hidden md:block' : ''}`}>
            <p className={`text-[9px] md:text-[10px] font-bold mb-1 ${colorClass}`}>{label}</p>
            <p className="text-xs md:text-sm font-black text-white">{val.toLocaleString()}</p>
        </div>
    );

    return (
        <div className="space-y-6 md:space-y-8 fade-in text-right pb-20" dir="rtl">
            {/* 🚀 Strategic Top Bar - Cleaned & Minimized for Mobile */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-6 gap-2 md:gap-4 bg-slate-900/50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-800 shadow-xl backdrop-blur-md sticky top-0 md:top-0 z-50 no-scrollbar">
                <TopStatItem label="الرصيد الحالي" val={stats?.topStats.currentBalance} colorClass="text-slate-500" />
                <TopStatItem label="الرصيد المتاح" val={stats?.topStats.availableBalance} colorClass="text-indigo-400" />
                <TopStatItem label="التزامات 30 يوم" val={stats?.topStats.total30DayObligations} colorClass="text-red-400" />
                
                {/* Expected values hidden on mobile to reduce density, visible on Desktop */}
                <TopStatItem label="الدخل المتوقع" val={stats?.topStats.expectedIncome} colorClass="text-emerald-400" hideOnMobile={true} />
                <TopStatItem label="المصروف المتوقع" val={stats?.topStats.expectedExpense} colorClass="text-orange-400" hideOnMobile={true} />
                
                <div className="flex-shrink-0 w-32 md:w-auto md:flex-1 text-center px-2">
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-bold mb-1">مؤشر الصحة</p>
                    <div className={`flex items-center justify-center gap-1 font-black text-xs md:text-sm ${getHealthColor(stats?.topStats.healthScore)}`}>
                        <Activity size={12} /> {stats?.topStats.healthScore}%
                    </div>
                </div>
            </div>

            <header className="px-2 md:px-0 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white italic">لوحة القيادة الذكية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">تحليل شامل وموحد لوضعك المالي</p>
                </div>
                {/* Mobile-only toggle for extra indicators */}
                <button 
                    onClick={() => setShowMoreIndicators(!showMoreIndicators)}
                    className="md:hidden flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full"
                >
                    مؤشرات إضافية <ChevronDown size={12} className={`transition-transform ${showMoreIndicators ? 'rotate-180' : ''}`} />
                </button>
            </header>

            {/* Main Indicators Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Health Gauge Card - Cleaned Code */}
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center">
                    <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle 
                                cx="50%" cy="50%" r="44%" 
                                stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className="text-slate-800"
                            />
                            <circle 
                                cx="50%" cy="50%" r="44%" 
                                stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className={getHealthColor(stats?.topStats.healthScore)} 
                                strokeDasharray="276" 
                                strokeDashoffset={276 - (276 * stats?.topStats.healthScore) / 100} 
                                strokeLinecap="round" 
                            />
                        </svg>
                        <div className="absolute">
                            <p className={`text-3xl md:text-5xl font-black ${getHealthColor(stats?.topStats.healthScore)}`}>{stats?.topStats.healthScore}</p>
                            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">الدرجة</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-6">
                        <p className="text-white font-bold text-sm md:text-base">وضعك المالي {stats?.topStats.healthScore > 70 ? 'ممتاز' : 'مستقر'}</p>
                        <p className="text-[10px] text-slate-500 mt-1">مبني على 4 معايير محاسبية</p>
                    </div>
                </div>

                {/* Indicators Grid - Optimized for Mobile with Toggle */}
                <div className={`lg:col-span-2 grid grid-cols-2 gap-4 md:gap-6 ${!showMoreIndicators ? 'hidden md:grid' : 'grid'}`}>
                    <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[3rem] shadow-xl">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                            <div className="p-2 md:p-3 bg-emerald-500/10 text-emerald-500 rounded-xl md:rounded-2xl"><TrendingUp size={20} /></div>
                        </div>
                        <p className="text-slate-500 text-[9px] md:text-xs mb-1 font-bold">الادخار</p>
                        <p className="text-xl md:text-3xl font-black text-white">{stats?.indicators.savingsRate}%</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[3rem] shadow-xl">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                            <div className="p-2 md:p-3 bg-red-500/10 text-red-500 rounded-xl md:rounded-2xl"><AlertCircle size={20} /></div>
                        </div>
                        <p className="text-slate-500 text-[9px] md:text-xs mb-1 font-bold">الديون</p>
                        <p className="text-xl md:text-3xl font-black text-white">{stats?.indicators.debtToIncomeRatio}%</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[3rem] shadow-xl col-span-2 flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stats?.indicators.hasOverdue ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h4 className="text-sm md:text-xl font-bold text-white">{stats?.indicators.hasOverdue ? 'متأخرات قائمة' : 'سجل نظيف'}</h4>
                                <p className="text-[9px] md:text-xs text-slate-500 mt-0.5">التزام كامل بمواعيد السداد</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-700" size={16} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Expense Chart */}
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[3rem] shadow-xl overflow-hidden">
                    <h3 className="text-base md:text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieIcon size={18} className="text-blue-500" /> توزيع المصاريف
                    </h3>
                    <div className="h-48 md:h-56 flex justify-center">
                        <Pie data={distributionData} options={{ 
                            maintainAspectRatio: false, 
                            plugins: { 
                                legend: { 
                                    position: 'bottom', 
                                    labels: { color: '#64748b', font: { size: 9, family: 'sans-serif' }, boxWidth: 10 } 
                                } 
                            } 
                        }} />
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[3rem] shadow-xl">
                    <h3 className="text-base md:text-lg font-bold text-white mb-6">أحدث الحركات</h3>
                    <div className="space-y-3">
                        {stats?.recentActions.map((action, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl md:rounded-2xl border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.source ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {action.source ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                    </div>
                                    <span className="text-xs md:text-sm font-bold text-white truncate max-w-[120px] md:max-w-[200px]">{action.source || action.note}</span>
                                </div>
                                <span className={`text-xs md:text-sm font-black ${action.source ? 'text-emerald-500' : 'text-red-500'}`}>
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
