import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // السطر المفقود الذي سبب المشكلة
import { 
    ShieldCheck, AlertTriangle, Landmark, 
    ArrowUpCircle, ArrowDownCircle, History, Info, 
    ChevronRight, CreditCard, Activity, Target
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard');
                setData(res.data);
            } catch (err) { 
                console.error('Dashboard Fetch Error:', err);
            } finally { 
                setLoading(false); 
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    
    if (!data) return <div className="text-center p-20 text-slate-500">مرحباً {user?.name}، ابدأ بإضافة مصروفاتك لترى التحليلات هنا.</div>;

    const liquidityData = {
        labels: ['متاح للتصرف', 'التزامات الشهر'],
        datasets: [{
            data: [data.liquidity?.availableAfterLiabilities || 0, data.liquidity?.monthlyLiabilities || 0],
            backgroundColor: ['#10b981', '#6366f1'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="fade-in space-y-8 pb-20 text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white">مرحباً، {user?.name}</h2>
                    <p className="text-slate-500 mt-1">نظرة فاحصة على وضعك المالي اليوم</p>
                </div>
                {data.warnings?.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" size={20} />
                        <span className="text-orange-200 text-sm font-bold">لديك {data.warnings.length} تنبيهات</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" /> وضع السيولة
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-800">
                                <p className="text-slate-500 text-xs mb-1">الرصيد الحر المتاح</p>
                                <p className="text-3xl font-black text-white">{(data.liquidity?.availableAfterLiabilities || 0).toLocaleString()} ج.م</p>
                            </div>
                        </div>
                        <div className="h-48 flex justify-center">
                            <Pie data={liquidityData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} /> مؤشر الديون
                    </h3>
                    <div className="text-center">
                        <p className="text-4xl font-black text-white">{data.debt?.debtToIncomeRatio || 0}%</p>
                        <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">نسبة الالتزامات</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">آخر العمليات</h3>
                    <Link to="/expenses" className="text-blue-500 text-sm hover:underline flex items-center gap-1">المزيد <ChevronRight size={16} /></Link>
                </div>
                <div className="space-y-4">
                    {data.recentTransactions?.length > 0 ? data.recentTransactions.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-800/20 rounded-2xl">
                            <span className="text-white font-bold">{t.note || t.source}</span>
                            <span className={t.type === 'income' ? 'text-emerald-400 font-black' : 'text-white'}>{t.amount.toLocaleString()} ج.م</span>
                        </div>
                    )) : <p className="text-slate-600 text-center py-10">لا توجد عمليات مؤخراً</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
