import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    PieChart as PieIcon, BarChart3, TrendingUp, 
    Clock, Target, ShieldCheck, AlertCircle, Sparkles,
    Wallet, CreditCard, Landmark, ArrowUpRight, ArrowDownLeft
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
    const timeline = data?.timeline || { next30Days: [], totalUpcoming30: 0 };
    const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];
    const categoryAnalysis = data?.categoryAnalysis || {};
    const wealth = data?.wealthDistribution || { cash: 0, certificates: 0, lent: 0, loans: 0, cards: 0, borrowed: 0 };

    // Charts Configurations
    const trendChartData = {
        labels: trends.length > 0 ? trends.map(t => t.month) : ['لا يوجد بيانات'],
        datasets: [
            { label: 'التدفقات الداخلة', data: trends.map(t => t.income || 0), borderColor: '#10b981', backgroundColor: '#10b98120', fill: true, tension: 0.4 },
            { label: 'التدفقات الخارجة', data: trends.map(t => t.expense || 0), borderColor: '#ef4444', backgroundColor: '#ef444420', fill: true, tension: 0.4 }
        ]
    };

    const categoryChartData = {
        labels: Object.keys(categoryAnalysis).length > 0 ? Object.keys(categoryAnalysis) : ['بدون فئة'],
        datasets: [{
            data: Object.values(categoryAnalysis).length > 0 ? Object.values(categoryAnalysis) : [0],
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#94a3b8'],
            borderWidth: 0,
        }]
    };

    const wealthChartData = {
        labels: ['النقدية والبنوك', 'الاستثمارات والشهادات', 'أموال لدى الغير (ديون لي)', 'قروض والتزامات', 'مديونيات البطاقات', 'أموال للغير (ديون عليّ)'],
        datasets: [{
            data: [wealth.cash, wealth.certificates, wealth.lent, wealth.loans, wealth.cards, wealth.borrowed],
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#eab308'],
            borderWidth: 0
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

    const pieOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12, family: 'Tajawal' }, padding: 20 } }
        }
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">مركز التقارير والقرارات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">تحليل معمق للبيانات وتوقعات ذكية لمستقبلك المالي</p>
                </div>
            </header>

            {/* 1) Executive Summary (Decision Bar) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 px-4 md:px-0">
                <SummaryCard label="معدل الادخار الشهري" val={`${summary.savingsRate || 0}%`} icon={<TrendingUp size={24} />} textColor="text-emerald-500" bgColor="bg-emerald-500/10" noUnit />
                <SummaryCard label="نسبة عبء الدين" val={`${summary.debtRatio || 0}%`} icon={<Clock size={24} />} textColor="text-orange-500" bgColor="bg-orange-500/10" noUnit />
                <SummaryCard label="إجمالي الأصول والسيولة" val={summary.totalAssets || 0} icon={<Wallet size={24} />} textColor="text-blue-500" bgColor="bg-blue-500/10" />
                <SummaryCard label="إجمالي الخصوم (الالتزامات)" val={summary.totalDebt || 0} icon={<AlertCircle size={24} />} textColor="text-red-500" bgColor="bg-red-500/10" />
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 md:px-0 border-b border-slate-800">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="نظرة عامة" />
                <TabButton active={activeTab === 'wealth'} onClick={() => setActiveTab('wealth')} label="المركز المالي" />
                <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} label="تحليل المصروفات" />
                <TabButton active={activeTab === 'obligations'} onClick={() => setActiveTab('obligations')} label="الالتزامات القادمة" />
                <TabButton active={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')} label="مراقبة الميزانيات" />
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
                        
                        {/* Smart Recommendations Section */}
                        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                                <Sparkles size={150} className="text-yellow-400" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                    <Sparkles className="text-yellow-400" /> توصيات المحرك الذكي هذا الشهر
                                </h3>
                                <div className="space-y-4">
                                    {recommendations.length > 0 ? recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-4 p-5 bg-indigo-950/40 rounded-2xl border border-indigo-500/20">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                                            <p className="text-base text-indigo-100 leading-relaxed font-bold">{rec}</p>
                                        </div>
                                    )) : (
                                        <div className="p-5 bg-emerald-900/20 rounded-2xl border border-emerald-500/20">
                                            <p className="text-emerald-400 font-bold">وضعك المالي مستقر ومتوازن بناءً على بياناتك المسجلة.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'wealth' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <Landmark className="text-emerald-500" /> المركز المالي (الأصول مقابل الخصوم)
                                </h3>
                                <div className="h-[350px]"><Pie data={wealthChartData} options={pieOptions} /></div>
                            </div>
                            <div className="flex-1 space-y-4 flex flex-col justify-center">
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
                                    <p className="text-xs text-emerald-500 font-bold mb-1">صافي الثروة المجمعة</p>
                                    <p className="text-3xl font-black text-white">{(summary.totalAssets - summary.totalDebt).toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                </div>
                                <div className="p-4 bg-slate-800/30 rounded-2xl flex justify-between">
                                    <span className="text-slate-400 font-bold">الأصول (Assets)</span>
                                    <span className="text-emerald-400 font-black">{summary.totalAssets.toLocaleString()} ج.م</span>
                                </div>
                                <div className="p-4 bg-slate-800/30 rounded-2xl flex justify-between">
                                    <span className="text-slate-400 font-bold">الالتزامات (Liabilities)</span>
                                    <span className="text-red-400 font-black">{summary.totalDebt.toLocaleString()} ج.م</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="space-y-8">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <PieIcon className="text-purple-500" /> توزيع مصروفات الشهر الحالي
                                </h3>
                                <div className="h-[350px]"><Pie data={categoryChartData} options={pieOptions} /></div>
                            </div>
                            <div className="flex-1 space-y-4 flex flex-col justify-center max-h-[400px] overflow-y-auto no-scrollbar">
                                {Object.keys(categoryAnalysis).length === 0 ? (
                                    <div className="text-center text-slate-500">لا توجد مصروفات مسجلة هذا الشهر</div>
                                ) : (
                                    Object.entries(categoryAnalysis).sort((a, b) => b[1] - a[1]).map(([cat, val], i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                                                <span className="font-bold text-slate-300 text-sm">{cat}</span>
                                            </div>
                                            <span className="font-black text-white text-lg">{val.toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span></span>
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
                                <Clock className="text-orange-500" /> الالتزامات المستحقة خلال 30 يوم
                            </h3>
                            <div className="space-y-4">
                                {timeline.next30Days?.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">لا توجد التزامات مجدولة قريباً</div>
                                ) : (
                                    timeline.next30Days?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 bg-slate-800/50 rounded-2xl border border-slate-800 hover:border-orange-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shadow-inner ${item.type === 'card' ? 'bg-orange-900/20 text-orange-500 border-orange-500/30' : item.type === 'loan' ? 'bg-red-900/20 text-red-500 border-red-500/30' : 'bg-purple-900/20 text-purple-500 border-purple-500/30'} border`}>
                                                    {item.type === 'card' ? <CreditCard size={20}/> : item.type === 'loan' ? <Landmark size={20}/> : <Wallet size={20}/>}
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-white">{item.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">{new Date(item.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                                </div>
                                            </div>
                                            <p className="text-xl font-black text-white">{item.amount?.toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span></p>
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
                                <Target className="text-blue-500" /> تحليل الانحرافات (الموازنات)
                            </h3>
                            {budgetPerformance.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">لم يتم اعتماد ميزانيات لهذا الشهر</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {budgetPerformance.map((b, i) => (
                                        <div key={i} className={`p-6 rounded-[2rem] border transition-all ${b.status === 'over' ? 'bg-red-900/10 border-red-500/30' : b.status === 'warning' ? 'bg-amber-900/10 border-amber-500/30' : 'bg-slate-800/30 border-slate-800'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="font-black text-white text-lg">{b.category}</span>
                                                <span className={`text-xs font-black px-3 py-1 rounded-xl ${b.status === 'over' ? 'bg-red-500/20 text-red-500' : b.status === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                                    {b.percent}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-950 rounded-full overflow-hidden mb-4">
                                                <div className={`h-full transition-all duration-1000 ${b.status === 'over' ? 'bg-red-500' : b.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(b.percent, 100)}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                                <span className="text-slate-500">منفق: <span className="text-white ml-1">{b.spent.toLocaleString()}</span></span>
                                                <span className="text-slate-500">مخطط: <span className="text-slate-300 ml-1">{b.limit.toLocaleString()}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SummaryCard = ({ label, val, icon, textColor, bgColor, noUnit }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl hover:border-slate-700 transition-all flex flex-col items-center justify-center text-center">
        <div className={`w-14 h-14 rounded-[1.5rem] ${bgColor} ${textColor} flex items-center justify-center mb-6 shadow-inner`}>{icon}</div>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">{label}</p>
        <p className={`text-2xl md:text-3xl font-black ${textColor}`}>
            {typeof val === 'number' ? val.toLocaleString() : val} 
            {!noUnit && <span className="text-[10px] opacity-50 mr-1 text-slate-500">ج.م</span>}
        </p>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-4 text-xs md:text-sm font-black transition-all border-b-4 whitespace-nowrap rounded-t-2xl ${active ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
    >
        {label}
    </button>
);

export default Reports;
