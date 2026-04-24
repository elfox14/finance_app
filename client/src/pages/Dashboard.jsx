import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Wallet, TrendingDown, Landmark, PiggyBank, History } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const { user } = useAuth();

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

    if (!stats) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="fade-in space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="الرصيد المتاح" value={stats.currentBalance} color="emerald" icon={<Wallet />} />
                <StatCard title="إجمالي الديون" value={stats.totalLoanRemaining} color="red" icon={<Landmark />} />
                <StatCard title="قيمة الشهادات" value={stats.totalCertValue} color="blue" icon={<PiggyBank />} />
                <StatCard title="مصروفات الشهر" value={stats.totalExpense} color="orange" icon={<TrendingDown />} />
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <History className="text-blue-500" />
                        <h3 className="text-xl font-bold">آخر العمليات</h3>
                    </div>
                    <div className="space-y-4">
                        {stats.recentTransactions?.length > 0 ? (
                            stats.recentTransactions.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{t.desc || t.source}</div>
                                            <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('ar-EG')}</div>
                                        </div>
                                    </div>
                                    <div className={`font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ج.م
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-500 italic">لا توجد عمليات مسجلة بعد.</div>
                        )}
                    </div>
                </div>

                {/* Right Info Box */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20">
                        <h4 className="text-lg font-bold mb-2">توفير ذكي 💡</h4>
                        <p className="text-blue-100 text-sm leading-relaxed">بناءً على مصروفاتك، يمكنك توفير 15% من دخلك هذا الشهر إذا قللت من "المطاعم".</p>
                        <button className="mt-6 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md">مشاهدة التفاصيل</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => {
    const colors = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-slate-400 text-sm mb-1 font-medium">{title}</p>
            <p className="text-2xl font-black text-white leading-none">
                {value.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </p>
        </div>
    );
};

const ArrowUpCircle = ({ size }) => <ArrowUpCircleIcon size={size} />;
import { ArrowUpCircle as ArrowUpCircleIcon, ArrowDownCircle as ArrowDownCircleIcon } from 'lucide-react';
const ArrowDownCircle = ({ size }) => <ArrowDownCircleIcon size={size} />;

export default Dashboard;
