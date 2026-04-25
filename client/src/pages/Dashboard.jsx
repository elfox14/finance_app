import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Wallet, Landmark, PiggyBank, History, ArrowUpCircle, ArrowDownCircle, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard');
                setStats(res.data);
            } catch (err) {
                console.error('Dashboard Fetch Error:', err);
                setError('فشل تحميل بيانات لوحة التحكم');
            }
        };
        fetchStats();
    }, []);

    if (error) return <div className="text-red-500 text-center p-20 font-bold">{error}</div>;
    if (!stats) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const pieData = {
        labels: ['المدخولات', 'المصروفات'],
        datasets: [{
            data: [stats.totalIncome, stats.totalExpense],
            backgroundColor: ['#10b981', '#f43f5e'],
            borderWidth: 0,
        }]
    };

    const barData = {
        labels: ['الرصيد', 'الديون', 'الشهادات'],
        datasets: [{
            label: 'المبالغ (ج.م)',
            data: [stats.currentBalance, stats.totalLoanRemaining, stats.totalCertValue],
            backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6'],
            borderRadius: 10,
        }]
    };

    return (
        <div className="fade-in space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">أهلاً بك يا {user?.name?.split(' ')[0]} 👋</h2>
                    <p className="text-slate-500">إليك ملخص شامل لحساباتك المالية</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
                    <p className="text-xs text-slate-500 mb-1">الرصيد المتاح حالياً</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.currentBalance.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="إجمالي الدخل" value={stats.totalIncome} color="emerald" icon={<ArrowUpCircle />} />
                <StatCard title="إجمالي المصروفات" value={stats.totalExpense} color="red" icon={<ArrowDownCircle />} />
                <StatCard title="الديون القائمة" value={stats.totalLoanRemaining} color="orange" icon={<Landmark />} />
                <StatCard title="المدخرات/الشهادات" value={stats.totalCertValue} color="blue" icon={<PiggyBank />} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <PieIcon className="text-blue-500" /> تحليل السيولة
                    </h3>
                    <div className="h-64 flex justify-center">
                        <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#64748b', font: { weight: 'bold' } } } } }} />
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <BarChart3 className="text-emerald-500" /> الميزانية العامة
                    </h3>
                    <div className="h-64">
                        <Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#64748b' } } }, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <History className="text-blue-500" /> آخر العمليات
                    </h3>
                    <Link to="/expenses" className="text-blue-500 text-sm hover:underline">عرض الكل</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.recentTransactions?.slice(0, 6).map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-slate-800/30 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-sm">{t.note || t.source || 'عملية مالية'}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('ar-EG')}</div>
                                </div>
                            </div>
                            <div className={`font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => {
    const styles = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${styles[color]}`}>{icon}</div>
            <p className="text-slate-500 text-xs mb-1 font-medium">{title}</p>
            <p className="text-xl font-black text-white">{Number(value || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">ج.م</span></p>
        </div>
    );
};

export default Dashboard;
