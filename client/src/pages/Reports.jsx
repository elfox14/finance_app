import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    PieChart as PieIcon, BarChart3, TrendingUp, 
    TrendingDown, Calendar, Filter, ChevronDown,
    ArrowUpRight, ArrowDownLeft, Target,
    ShieldCheck, AlertCircle, Info, Sparkles,
    CreditCard, Landmark, Wallet, Clock,
    ArrowRight, ChevronRight, PieChart, BarChart
} from 'lucide-react';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, 
    BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement 
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports-data');
            setData(res.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setData({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const summary = data?.summary || {};
    const trends = Array.isArray(data?.trends) ? data.trends : [];
    const budgetPerformance = Array.isArray(data?.budgetPerformance) ? data.budgetPerformance : [];
    const timeline = data?.timeline || { next7Days: [], next30Days: [], totalUpcoming30: 0 };
    const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];
    const categoryAnalysis = data?.categoryAnalysis || {};

    // Chart Data Configurations
    const trendChartData = {
        labels: trends.length > 0 ? trends.map(t => t.month) : ['لا يوجد بيانات'],
        datasets: [
            { label: 'الدخل', data: trends.map(t => t.income || 0), borderColor: '#10b981', backgroundColor: '#10b98120', fill: true, tension: 0.4 },
            { label: 'المصاريف', data: trends.map(t => t.expense || 0), borderColor: '#ef4444', backgroundColor: '#ef444420', fill: true, tension: 0.4 }
        ]
    };

    const categoryChartData = {
        labels: Object.keys(categoryAnalysis).length > 0 ? Object.keys(categoryAnalysis) : ['بدون فئة'],
        datasets: [{
            data: Object.values(categoryAnalysis).length > 0 ? Object.values(categoryAnalysis) : [0],
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 8, padding: 15 } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 fade-in text-right pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">مركز القرارات المالية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تحليل معمق وتوقعات ذكية</p>
                </div>
            </header>

            {/* 1) Executive Summary (Decision Bar) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
                <SummaryCard label="نسبة الادخار" val={`${summary.savingsRate}%`} icon={<TrendingUp size={18} />} color="emerald" />
                <SummaryCard label="عبء الديون" val={`${summary.debtRatio}%`} icon={<Clock size={18} />} color="orange" />
                <SummaryCard label="الصافي المتوقع" val={summary.totalAssets} icon={<Wallet size={18} />} color="blue" />
                <SummaryCard label="إجمالي الالتزامات" val={summary.totalDebt} icon={<AlertCircle size={18} />} color="red" />
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 md:px-0 border-b border-slate-800">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="نظرة عامة" />
                <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} label="المصروفات" />
                <TabButton active={activeTab === 'obligations'} onClick={() => setActiveTab('obligations')} label="الالتزامات" />
                <TabButton active={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')} label="الميزانيات" />
            </div>

            {/* Tabs Content */}
            <div className="px-4 md:px-0">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl h-96">
                            <h3 className="text-lg font-black text-white mb-6">تحليل التدفق النقدي (6 أشهر)</h3>
                            <Line data={trendChartData} options={chartOptions} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                                <h3 className="text-lg font-black text-white mb-6">توزيع المصروفات</h3>
                                <div className="h-64"><Pie data={categoryChartData} options={chartOptions} /></div>
                             </div>
                             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                                <h3 className="text-lg font-black text-white mb-6">توقعات ذكية</h3>
                                <div className="space-y-4">
                                    <PredictionItem 
                                        label="الرصيد المتوقع نهاية الشهر" 
                                        val={(summary.totalAssets || 0) + (trends.length > 0 ? (trends[trends.length - 1].net || 0) : 0)} 
                                        color="blue" 
                                    />
                                    <p className="text-xs text-slate-500 leading-relaxed italic">
                                        * تعتمد التوقعات على معدل الإنفاق الحالي والالتزامات المجدولة خلال الـ 30 يوماً القادمة.
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
                            <h3 className="text-xl font-black text-white mb-8">تفاصيل استهلاك الفئات</h3>
                            <div className="space-y-6">
                                {Object.entries(categoryAnalysis).sort((a, b) => b[1] - a[1]).map(([cat, val], i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                            <span className="font-bold text-white">{cat}</span>
                                        </div>
                                        <span className="font-black text-white">{val.toLocaleString()} ج.م</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'obligations' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
                            <h3 className="text-xl font-black text-white mb-8 italic">جدول الالتزامات القادمة</h3>
                            <div className="space-y-4">
                                {timeline.next30Days?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-orange-500">
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{item.name}</p>
                                                <p className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-white">{item.amount?.toLocaleString()} ج.م</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'budgets' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem]">
                            <h3 className="text-xl font-black text-white mb-8 italic">أداء الميزانيات</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {budgetPerformance.map((b, i) => (
                                    <div key={i} className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-800">
                                        <div className="flex justify-between mb-4">
                                            <span className="font-bold text-white">{b.category}</span>
                                            <span className={`text-xs font-black ${b.status === 'over' ? 'text-red-500' : 'text-emerald-500'}`}>{b.percent}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                            <div className={`h-full ${b.status === 'over' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${b.percent}%` }}></div>
                                        </div>
                                        <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-bold">
                                            <span>المنفق: {b.spent.toLocaleString()}</span>
                                            <span>الحد: {b.limit.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Recommendations Section */}
            <div className="px-4 md:px-0">
                <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> توصيات هذا الشهر
                        </h3>
                        <div className="space-y-4">
                            {recommendations.length > 0 ? recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-4 text-indigo-100">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                                    <p className="text-sm md:text-base leading-relaxed">{rec}</p>
                                </div>
                            )) : (
                                <p className="text-indigo-200">وضعك المالي منضبط جداً هذا الشهر، استمر في هذا الأداء!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, val, icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl group hover:border-slate-700 transition-all">
        <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
        <p className="text-lg md:text-xl font-black text-white">{typeof val === 'number' ? val.toLocaleString() : val} <span className="text-[10px] opacity-50">ج.م</span></p>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-4 text-xs md:text-sm font-bold transition-all border-b-2 whitespace-nowrap ${active ? 'border-blue-500 text-white bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
    >
        {label}
    </button>
);

const PredictionItem = ({ label, val, color }) => (
    <div className="flex justify-between items-center p-4 bg-slate-800/30 rounded-2xl">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <span className={`text-lg font-black text-${color}-400`}>{val.toLocaleString()} ج.م</span>
    </div>
);

export default Reports;
