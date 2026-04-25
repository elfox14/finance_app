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
            const res = await api.get('/dashboard'); // Currently using dashboard data for reports
            setReportData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReports(); }, [timeRange]);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    // Charts Config Optimized for Mobile
    const expenseDistribution = {
        labels: Object.keys(reportData?.distribution || {}),
        datasets: [{
            data: Object.values(reportData?.distribution || {}),
            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
            borderWidth: 0,
        }]
    };

    const monthlyTrend = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'الدخل',
                data: [5000, 5500, 4800, 6000, 7000, 6500],
                borderColor: '#10b981',
                tension: 0.4,
                fill: false,
            },
            {
                label: 'المصاريف',
                data: [4000, 4200, 4500, 3800, 5000, 4800],
                borderColor: '#ef4444',
                tension: 0.4,
                fill: false,
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    boxWidth: 8,
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                padding: 12,
                cornerRadius: 12
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: '#334155' }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 fade-in text-right pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">التقارير التحليلية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">رؤية عميقة لتدفقاتك المالية واتجاهات الإنفاق</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit self-end md:self-auto">
                    {['week', 'month', 'year'].map(r => (
                        <button 
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === r ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {r === 'week' ? 'أسبوع' : r === 'month' ? 'شهر' : 'سنة'}
                        </button>
                    ))}
                </div>
            </header>

            {/* Top Insights - Simplified for Mobile Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">معدل الانفاق اليومي</p>
                    <p className="text-xl md:text-2xl font-black text-white">{(reportData?.topStats.expectedExpense / 30).toFixed(0)} <span className="text-xs">ج.م</span></p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                        <ArrowDownLeft size={12} /> 4% أقل من المعتاد
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">نسبة السيولة المتاحة</p>
                    <p className="text-xl md:text-2xl font-black text-blue-500">{((reportData?.topStats.availableBalance / reportData?.topStats.currentBalance) * 100).toFixed(0)}%</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 font-bold underline cursor-pointer">
                        تحليل المخاطر
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl col-span-2 md:col-span-1">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">أكبر فئة مصروفات</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-black text-white">الطعام والشراب</p>
                        <div className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] rounded-lg font-bold">32%</div>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl col-span-2 md:col-span-1">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">حالة الموازنة</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-xs font-black text-white">65%</span>
                    </div>
                </div>
            </div>

            {/* Charts Section - Focused & Full Width on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 md:px-0">
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-500" /> اتجاهات الدخل والمصروف
                    </h3>
                    <div className="h-64 md:h-80">
                        <Line data={monthlyTrend} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <PieIcon size={20} className="text-emerald-500" /> تحليل المصروفات حسب الفئة
                    </h3>
                    <div className="h-64 md:h-80">
                        <Pie data={expenseDistribution} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Deep Analysis Card - Simplified for Mobile */}
            <div className="mx-4 md:mx-0 p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-black flex items-center gap-3 mb-4">
                        <Target /> نصيحة "جيبي" الذكية
                    </h3>
                    <p className="text-blue-100 text-sm md:text-base leading-relaxed opacity-90">
                        بناءً على تحليلات الشهر الحالي، نلاحظ زيادة بنسبة 15% في مصروفات "الكماليات". إذا قمت بتقليلها بمقدار 500 ج.م فقط، ستتمكن من سداد قسط "جمعية أكتوبر" قبل موعده بـ 10 أيام، مما سيرفع مؤشر صحتك المالية إلى 92%.
                    </p>
                    <button className="mt-8 bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-xl">
                        عرض خطة التوفير
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
