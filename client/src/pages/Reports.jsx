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

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

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
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 12, family: 'Tajawal' }, padding: 20 } }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'Tajawal' } } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { family: 'Tajawal' } } }
        }
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">مركز القرارات المالية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">تحليل معمق للبيانات وتوقعات ذكية لمستقبلك المالي</p>
                </div>
            </header>

            {/* 1) Executive Summary (Decision Bar) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4 md:px-0">
                <SummaryCard label="نسبة الادخار" val={`${summary.savingsRate || 0}%`} icon={<TrendingUp size={24} />} textColor="text-emerald-500" bgColor="bg-emerald-500/10" noUnit />
                <SummaryCard label="عبء الديون" val={`${summary.debtRatio || 0}%`} icon={<Clock size={24} />} textColor="text-orange-500" bgColor="bg-orange-500/10" noUnit />
                <SummaryCard label="الصافي المتوقع" val={summary.totalAssets || 0} icon={<Wallet size={24} />} textColor="text-blue-500" bgColor="bg-blue-500/10" />
                <SummaryCard label="إجمالي الالتزامات" val={summary.totalDebt || 0} icon={<AlertCircle size={24} />} textColor="text-red-500" bgColor="bg-red-500/10" />
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
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl h-96">
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="text-blue-500" /> تحليل التدفق النقدي (6 أشهر)
                            </h3>
                            <div className="h-[calc(100%-2rem)]"><Line data={trendChartData} options={chartOptions} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <PieIcon className="text-purple-500" /> توزيع المصروفات
                                </h3>
                                <div className="h-[300px] flex-1"><Pie data={categoryChartData} options={chartOptions} /></div>
                             </div>
                             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <Sparkles size={120} className="text-blue-500" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2 relative z-10">
                                    <Target className="text-blue-500" /> توقعات ذكية
                                </h3>
                                <div className="space-y-6 relative z-10">
                                    <PredictionItem 
                                        label="الرصيد المتوقع نهاية الشهر" 
                                        val={(summary.totalAssets || 0) + (trends.length > 0 ? (trends[trends.length - 1].net || 0) : 0)} 
                                        color="text-blue-400" 
                                        bgColor="bg-blue-900/20"
                                    />
                                    <p className="text-sm text-slate-500 leading-relaxed italic bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                                        * تعتمد التوقعات على معدل الإنفاق الحالي والالتزامات المجدولة خلال الـ 30 يوماً القادمة.
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                <PieIcon className="text-purple-500" /> تفاصيل استهلاك الفئات
                            </h3>
                            <div className="space-y-6">
                                {Object.keys(categoryAnalysis).length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">لا توجد بيانات مصروفات حالياً</div>
                                ) : (
                                    Object.entries(categoryAnalysis).sort((a, b) => b[1] - a[1]).map(([cat, val], i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                                <span className="font-bold text-white text-lg">{cat}</span>
                                            </div>
                                            <span className="font-black text-white text-xl">{val.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'obligations' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3">
                                <Clock className="text-orange-500" /> جدول الالتزامات القادمة (30 يوم)
                            </h3>
                            <div className="space-y-4">
                                {timeline.next30Days?.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">لا توجد التزامات مجدولة قريباً</div>
                                ) : (
                                    timeline.next30Days?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-slate-800/50 rounded-2xl border border-slate-800">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-[1rem] bg-slate-900 border border-slate-700 flex items-center justify-center text-orange-500 shadow-inner">
                                                    <Clock size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                                </div>
                                            </div>
                                            <p className="text-xl font-black text-white">{item.amount?.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'budgets' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3">
                                <Target className="text-blue-500" /> أداء الميزانيات المحددة
                            </h3>
                            {budgetPerformance.length === 0 ? (
                                <div className="text-center py-10 text-slate-500">لم يتم تحديد أي ميزانيات بعد</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {budgetPerformance.map((b, i) => (
                                        <div key={i} className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-800">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="font-black text-white text-xl">{b.category}</span>
                                                <span className={`text-sm font-black px-3 py-1 rounded-xl ${b.status === 'over' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{b.percent}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-900 rounded-full overflow-hidden mb-6">
                                                <div className={`h-full transition-all duration-1000 ${b.status === 'over' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${b.percent}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 font-bold">
                                                <span>المنفق: <span className="text-white ml-1">{b.spent.toLocaleString()}</span></span>
                                                <span>الحد: <span className="text-slate-300 ml-1">{b.limit.toLocaleString()}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Recommendations Section */}
            <div className="px-4 md:px-0">
                <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                        <Sparkles size={150} className="text-yellow-400" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> توصيات المحرك الذكي هذا الشهر
                        </h3>
                        <div className="space-y-6">
                            {recommendations.length > 0 ? recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 bg-indigo-950/40 rounded-2xl border border-indigo-500/20">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                                    <p className="text-base text-indigo-100 leading-relaxed font-bold">{rec}</p>
                                </div>
                            )) : (
                                <div className="p-5 bg-emerald-900/20 rounded-2xl border border-emerald-500/20">
                                    <p className="text-emerald-400 font-bold">وضعك المالي منضبط جداً هذا الشهر، استمر في هذا الأداء الرائع!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, val, icon, textColor, bgColor, noUnit }) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl hover:border-slate-700 transition-all flex flex-col items-center justify-center text-center">
        <div className={`w-14 h-14 rounded-[1.5rem] ${bgColor} ${textColor} flex items-center justify-center mb-6 shadow-inner`}>{icon}</div>
        <p className="text-xs text-slate-500 font-bold uppercase mb-2 tracking-widest">{label}</p>
        <p className={`text-3xl font-black ${textColor}`}>
            {typeof val === 'number' ? val.toLocaleString() : val} 
            {!noUnit && <span className="text-sm opacity-50 mr-1 text-slate-500">ج.م</span>}
        </p>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`px-8 py-5 text-sm md:text-base font-black transition-all border-b-4 whitespace-nowrap ${active ? 'border-blue-500 text-white bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
    >
        {label}
    </button>
);

const PredictionItem = ({ label, val, color, bgColor }) => (
    <div className={`flex justify-between items-center p-6 ${bgColor} border border-slate-700/50 rounded-2xl`}>
        <span className="text-sm font-bold text-slate-300">{label}</span>
        <span className={`text-2xl font-black ${color}`}>{val.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></span>
    </div>
);

export default Reports;
