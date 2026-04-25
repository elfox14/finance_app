import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    BarChart, PieChart as PieIcon, TrendingUp, 
    TrendingDown, Calendar, Download, Filter
} from 'lucide-react';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, 
    BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/dashboard'); // نستخدم نفس البيانات حالياً
            setStats(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const cashFlowData = {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [
            {
                label: 'المدخولات',
                data: [12000, 15000, 13000, 18000, 14000, 16000],
                backgroundColor: '#10b981',
                borderRadius: 8,
            },
            {
                label: 'المصروفات',
                data: [8000, 9500, 11000, 12000, 9000, 10500],
                backgroundColor: '#ef4444',
                borderRadius: 8,
            }
        ]
    };

    const distributionData = {
        labels: Object.keys(stats?.distribution || {}),
        datasets: [{
            data: Object.values(stats?.distribution || {}),
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white">مركز التقارير التحليلية</h1>
                    <p className="text-slate-500 text-sm mt-1">رؤية محاسبية معمقة لأدائك المالي</p>
                </div>
                <button className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-2">
                    <Download size={16} /> تصدير PDF
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Monthly Cash Flow */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" /> تقرير التدفق النقدي الشهري
                    </h3>
                    <div className="h-64">
                        <Bar data={cashFlowData} options={{ 
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top', labels: { color: '#64748b' } } },
                            scales: { y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } }, x: { grid: { display: false }, ticks: { color: '#64748b' } } }
                        }} />
                    </div>
                </div>

                {/* 2. Expense Concentration */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3.5rem] shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <PieIcon size={20} className="text-blue-500" /> تحليل تركز المصروفات
                    </h3>
                    <div className="h-64 flex justify-center">
                        <Pie data={distributionData} options={{ 
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'right', labels: { color: '#64748b', boxWidth: 10 } } }
                        }} />
                    </div>
                </div>
            </div>

            {/* 3. Financial Health Radar (Summary Tables) */}
            <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 shadow-xl overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-10">مؤشرات الاستقرار المالي</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">نسبة السيولة</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">1.8</span>
                            <span className="text-xs text-emerald-500 mb-2 font-bold">آمنة جداً</span>
                        </div>
                        <p className="text-[10px] text-slate-600">سيولتك الحالية تغطي التزاماتك القريبة بمقدار 1.8 مرة.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">معدل الادخار الشهري</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{stats?.indicators.savingsRate}%</span>
                            <span className="text-xs text-blue-500 mb-2 font-bold">تحسن +2%</span>
                        </div>
                        <p className="text-[10px] text-slate-600">نسبة المتبقي من دخلك بعد خصم كافة المصاريف والالتزامات.</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">أيام الأمان (Runway)</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{Math.round(stats?.indicators.safetyMonths * 30)}</span>
                            <span className="text-xs text-yellow-500 mb-2 font-bold">يوم</span>
                        </div>
                        <p className="text-[10px] text-slate-600">المدة المتوقعة لصمود رصيدك في حال توقف الدخل تماماً اليوم.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
