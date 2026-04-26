import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    PieChart as PieIcon, BarChart3, TrendingUp, 
    TrendingDown, Calendar, Filter, ChevronDown,
    ArrowUpRight, ArrowDownLeft, Target
} from 'lucide-react';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, 
    BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement 
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');

    const fetchReports = async () => {
        try {
            const res = await api.get('/dashboard'); 
            setReportData(res.data || {});
        } catch (err) { 
            console.error(err);
            setReportData({});
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchReports(); }, [timeRange]);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    // استخراج البيانات بأمان فائق
    const topStats = reportData?.topStats || {};
    const distribution = reportData?.distribution || {};

    const expenseDistribution = {
        labels: Object.keys(distribution),
        datasets: [{
            data: Object.values(distribution),
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
            borderWidth: 0,
        }]
    };

    const monthlyTrend = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            { label: 'الدخل', data: [5000, 5500, 4800, 6000, 7000, 6500], borderColor: '#10b981', tension: 0.4 },
            { label: 'المصاريف', data: [4000, 4200, 4500, 3800, 5000, 4800], borderColor: '#ef4444', tension: 0.4 }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 8, padding: 15 } }
        },
        scales: {
            x: { ticks: { color: '#64748b', font: { size: 10 } } },
            y: { ticks: { color: '#64748b', font: { size: 10 } } }
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 fade-in text-right pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">التقارير التحليلية</h1>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">معدل الانفاق اليومي</p>
                    <p className="text-xl md:text-2xl font-black text-white">
                        {((topStats.expectedExpense || 0) / 30).toFixed(0)} <span className="text-xs">ج.م</span>
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">نسبة السيولة المتاحة</p>
                    <p className="text-xl md:text-2xl font-black text-blue-500">
                        {topStats.currentBalance ? ((topStats.availableBalance / topStats.currentBalance) * 100).toFixed(0) : 0}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 md:px-0">
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl h-80 md:h-96">
                    <Line data={monthlyTrend} options={chartOptions} />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl h-80 md:h-96">
                    <Pie data={expenseDistribution} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default Reports;
