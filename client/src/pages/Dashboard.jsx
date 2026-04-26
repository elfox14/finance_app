import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, TrendingDown, Clock, 
    ChevronRight, AlertCircle, ShieldCheck,
    ChevronDown, ChevronUp, Plus, PieChart as PieIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    Chart as ChartJS, ArcElement, Tooltip, Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// تسجيل مكونات الرسم البياني
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllStats, setShowAllStats] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, transRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/expenses/latest')
            ]);
            setStats(statsRes.data || {});
            setTransactions(Array.isArray(transRes.data) ? transRes.data : (transRes.data?.expenses || []));
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
    const healthFactors = stats?.healthFactors || {};
    const distribution = stats?.distribution || {};

    // إعداد بيانات الرسم البياني الحقيقي
    const chartData = {
        labels: Object.keys(distribution).length > 0 ? Object.keys(distribution) : ['لا يوجد بيانات'],
        datasets: [{
            data: Object.values(distribution).length > 0 ? Object.values(distribution) : [1],
            backgroundColor: [
                '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'
            ],
            borderWidth: 0,
            hoverOffset: 15
        }]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { size: 10, weight: 'bold' },
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 12,
                titleFont: { size: 14, weight: 'bold' }
            }
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">نظرة عامة</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تحليل شامل لوضعك المالي الحالي</p>
                </div>
                <Link to="/expenses" className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-900/40 hover:scale-105 transition-transform">
                    <Plus size={24} />
                </Link>
            </header>

            {/* Strategic Top Stats */}
            <div className="grid grid-cols-1 gap-6 px-4 md:px-0">
                <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
                    <TopStatItem label="الرصيد الحالي" val={topStats.currentBalance || 0} icon={<Wallet />} color="bg-blue-600" />
                    <TopStatItem label="السيولة المتاحة" val={topStats.availableBalance || 0} icon={<TrendingUp />} color="bg-emerald-600" />
                    <TopStatItem label="إجمالي الالتزامات" val={topStats.totalObligations || 0} icon={<Clock />} color="bg-orange-600" />
                    <div className="flex-shrink-0 w-72 md:w-auto bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الصحة المالية</p>
                            <p className={`text-3xl font-black ${getHealthColor(topStats.healthScore)}`}>
                                {topStats.healthScore !== undefined ? topStats.healthScore : 0}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-slate-800 ${getHealthColor(topStats.healthScore)}`}>
                            <ShieldCheck size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Real Pie Chart Section - Spending Analysis */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <PieIcon className="text-blue-500" size={20} /> تحليل الإنفاق
                        </h3>
                    </div>
                    <div className="relative w-full h-64 md:h-72">
                        {Object.keys(distribution).length > 0 ? (
                            <Pie data={chartData} options={chartOptions} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20">
                                <PieIcon size={64} className="mb-4" />
                                <p className="text-sm font-bold">لا يوجد بيانات إنفاق كافية</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial Efficiency - Health Gauge */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3">
                        <TrendingUp className="text-blue-500" /> جودة الميزانية
                    </h3>
                    <div className="flex flex-col items-center">
                        <div className="relative w-44 h-44 flex items-center justify-center mb-8">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className={getHealthColor(topStats.healthScore)} strokeDasharray={502} strokeDashoffset={502 - (502 * (topStats.healthScore || 0)) / 100} strokeLinecap="round" />
                            </svg>
                            <div className="absolute text-center">
                                <p className={`text-4xl font-black ${getHealthColor(topStats.healthScore)}`}>{topStats.healthScore || 0}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">نقطة</p>
                            </div>
                        </div>
                        <div className="w-full space-y-4">
                            <HealthFactor label="معدل الادخار" percent={healthFactors.savingsRate || 0} />
                            <HealthFactor label="السيولة" percent={healthFactors.liquidityScore || 0} />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black text-white mb-8">آخر العمليات</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
                        {transactions.length > 0 ? (
                            transactions.map((t, i) => (
                                <div key={i} className="flex items-center justify-between group p-2 rounded-2xl hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white truncate max-w-[100px]">{t.category || t.source || 'عام'}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(t.date).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                        {t.amount?.toLocaleString() || 0}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-20 italic text-xs">لا يوجد عمليات</div>
                        )}
                    </div>
                    <Link to="/reports" className="mt-8 w-full py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl font-black text-sm text-center transition-all">تحليل كامل</Link>
                </div>
            </div>
        </div>
    );
};

const TopStatItem = ({ label, val, icon, color }) => (
    <div className="flex-shrink-0 w-72 md:w-auto bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl group hover:border-blue-500/30 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-blue-900/10`}>{icon}</div>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{(val || 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
    </div>
);

const HealthFactor = ({ label, percent }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
            <span className="text-xs font-black text-white">{percent}%</span>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default Dashboard;
