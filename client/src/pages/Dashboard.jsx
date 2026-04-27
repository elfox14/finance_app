import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, Clock, 
    AlertCircle, ShieldCheck,
    Plus, PieChart as PieIcon, 
    Sparkles, Lightbulb, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
        insights = [],
        charts = { cashflow: [], categories: [], assets: [] }
    } = stats || {};

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-blue-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    // --- Chart Data Preparation ---
    const reversedCashflow = [...charts.cashflow].reverse(); // from oldest to newest for the chart
    
    const lineChartData = {
        labels: reversedCashflow.map(d => d.month),
        datasets: [
            {
                label: 'الدخل',
                data: reversedCashflow.map(d => d.income),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'المصروفات',
                data: reversedCashflow.map(d => d.expense),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const doughnutChartData = {
        labels: charts.assets.map(a => a.name),
        datasets: [{
            data: charts.assets.map(a => a.value),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const barChartData = {
        labels: charts.categories.slice(0, 5).map(c => c.name),
        datasets: [{
            label: 'المصروفات حسب الفئة',
            data: charts.categories.slice(0, 5).map(c => c.value),
            backgroundColor: '#3b82f6',
            borderRadius: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Tajawal' } } } },
        scales: {
            x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { family: 'Tajawal' } } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8', font: { family: 'Tajawal' } } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Tajawal' } } } },
        cutout: '75%'
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">قمرة القيادة</h1>
                        <span className="bg-blue-600/10 text-blue-500 text-[10px] px-2 py-1 rounded-md font-bold border border-blue-500/20">v4.0 Pro</span>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">نظام التحليل المالي والمحاسبي الذكي</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/expenses" className="px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-900/40 hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <Plus size={20} /> إضافة معاملة
                    </Link>
                </div>
            </header>

            <div className="px-4 md:px-0 space-y-8">
                
                {/* 1. KPI Cards */}
                <section>
                    <h2 className="text-slate-500 font-bold text-sm tracking-wider uppercase mb-4">المؤشرات الرئيسية</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="الرصيد الصافي" val={topStats.currentBalance} icon={<Wallet size={20} />} color="bg-blue-600" />
                        <StatCard label="التدفق النقدي" val={topStats.expectedNetFlow} icon={<TrendingUp size={20} />} color="bg-emerald-600" />
                        <StatCard label="التزامات قادمة" val={topStats.next30DayObligations} icon={<ArrowDownLeft size={20} />} color="bg-orange-600" />
                        <StatCard label="حقوق قادمة" val={topStats.next30DayReceivables} icon={<ArrowUpRight size={20} />} color="bg-indigo-600" />
                        
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between shadow-xl">
                            <p className="text-[10px] text-slate-500 font-black uppercase">معدل الادخار</p>
                            <p className={`text-2xl font-black ${indicators.savingsRate > 15 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                {indicators.savingsRate}%
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-5">
                                <Activity size={80} />
                            </div>
                            <p className="text-[10px] text-slate-500 font-black uppercase">الصحة المالية</p>
                            <p className={`text-3xl font-black ${getHealthColor(topStats.healthScore)}`}>
                                {topStats.healthScore}%
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. Charts Layer */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cashflow Line Chart */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                            <TrendingUp className="text-emerald-500" /> التدفق النقدي (12 شهراً)
                        </h3>
                        <div className="h-[300px]">
                            {charts.cashflow.length > 0 ? (
                                <Line data={lineChartData} options={chartOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">لا توجد بيانات كافية</div>
                            )}
                        </div>
                    </div>

                    {/* Asset Distribution */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                            <PieIcon className="text-purple-500" /> توزيع الأصول
                        </h3>
                        <div className="flex-1 min-h-[250px] relative">
                            {charts.assets.length > 0 ? (
                                <>
                                    <Doughnut data={doughnutChartData} options={doughnutOptions} />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-24">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 font-bold">إجمالي الأصول</p>
                                            <p className="text-xl font-black text-white">
                                                {charts.assets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">لا توجد أصول مسجلة</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 3. Timeline & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Upcoming Obligations Timeline */}
                    <section className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2">
                            <Clock className="text-orange-500" /> الجدول الزمني للالتزامات
                        </h3>
                        <div className="relative border-r-2 border-slate-800 pr-6 space-y-8">
                            {upcomingObligations.map((item, i) => (
                                <div key={i} className="relative">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -right-[31px] w-4 h-4 rounded-full border-4 border-slate-900 ${
                                        item.type === 'loan' ? 'bg-orange-500' : 
                                        item.type === 'card' ? 'bg-blue-500' : 
                                        item.type === 'group' ? 'bg-purple-500' : 'bg-emerald-500'
                                    }`}></div>
                                    
                                    <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-black text-white">{item.name}</p>
                                            <p className="text-sm font-black text-white">{item.amount?.toLocaleString()} <span className="text-[10px] text-slate-500">ج.م</span></p>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(item.dueDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {upcomingObligations.length === 0 && (
                                <div className="text-center py-10 text-slate-500 text-sm">الطريق خالي، لا توجد التزامات! 🎉</div>
                            )}
                        </div>
                    </section>

                    {/* Categories Bar Chart & Insights */}
                    <section className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                                <Activity className="text-blue-500" /> أعلى 5 فئات صرف هذا الشهر
                            </h3>
                            <div className="h-[250px]">
                                {charts.categories.length > 0 ? (
                                    <Bar data={barChartData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">لا توجد مصاريف هذا الشهر</div>
                                )}
                            </div>
                        </div>

                        {/* Smart Alerts */}
                        <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[3rem] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                                <Sparkles size={150} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-black text-blue-400 flex items-center gap-2 mb-6 relative z-10">
                                <Lightbulb size={24} /> التنبيهات والقرارات الذكية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                {insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-slate-900/60 p-5 rounded-2xl border border-blue-500/10">
                                        <AlertCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-slate-200 font-bold leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                                {insights.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center col-span-full">لا توجد تنبيهات هامة، وضعك مستقر.</p>
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

export default Dashboard;
