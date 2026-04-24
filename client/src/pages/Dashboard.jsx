import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [user.token]);

    if (!stats) return <div className="text-white text-center p-20">جاري التحميل...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-extrabold">مرحباً، {user.name} 👋</h1>
                    <button onClick={logout} className="bg-red-500/10 text-red-500 px-6 py-2 rounded-xl font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                        تسجيل الخروج
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <StatCard title="الرصيد الحالي" value={stats.currentBalance} color="text-emerald-400" />
                    <StatCard title="إجمالي القروض" value={stats.totalLoanRemaining} color="text-red-400" />
                    <StatCard title="قيمة الشهادات" value={stats.totalCertValue} color="text-blue-400" />
                    <StatCard title="إجمالي الدخل" value={stats.totalIncome} color="text-emerald-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6">آخر العمليات</h3>
                        <div className="space-y-4">
                            {stats.recentTransactions.map(t => (
                                <div key={t._id} className="flex justify-between p-4 bg-slate-800/50 rounded-2xl">
                                    <span>{t.desc || t.source}</span>
                                    <span className={t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}>
                                        {t.amount} ج.م
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <p className="text-slate-400 text-sm mb-2">{title}</p>
        <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()} ج.م</p>
    </div>
);

export default Dashboard;
