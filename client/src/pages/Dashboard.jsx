import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    ShieldCheck, AlertTriangle, TrendingDown, Landmark, 
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
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (!data) return <div className="text-center p-20">لا توجد بيانات متاحة</div>;

    const liquidityData = {
        labels: ['متاح للتصرف', 'التزامات الشهر'],
        datasets: [{
            data: [data.liquidity.availableAfterLiabilities, data.liquidity.monthlyLiabilities],
            backgroundColor: ['#10b981', '#6366f1'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="fade-in space-y-8 pb-20 text-right" dir="rtl">
            {/* 1. Header & Quick Alert */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white">مرحباً، {user?.name}</h2>
                    <p className="text-slate-500 mt-1">نظرة فاحصة على وضعك المالي اليوم</p>
                </div>
                {data.warnings.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <AlertTriangle className="text-orange-500" size={20} />
                        <span className="text-orange-200 text-sm font-bold">لديك {data.warnings.length} تنبيهات تحتاج انتباهك</span>
                    </div>
                )}
            </div>

            {/* 2. Top Analytics Layers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Layer A: Liquidity Status */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" /> وضع السيولة
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">قدرتك على الصرف بعد سداد الالتزامات</p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-xs font-bold ${data.liquidity.status === 'safe' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {data.liquidity.status === 'safe' ? 'وضع آمن' : 'وضع حرج'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-800/40 rounded-3xl border border-slate-800">
                                <p className="text-slate-500 text-xs mb-1">الرصيد الحر المتاح</p>
                                <p className="text-3xl font-black text-white">{data.liquidity.availableAfterLiabilities.toLocaleString()} <span className="text-sm">ج.م</span></p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 p-4 bg-slate-800/20 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 text-[10px] mb-1">التزامات الشهر</p>
                                    <p className="font-bold text-indigo-400">{data.liquidity.monthlyLiabilities.toLocaleString()}</p>
                                </div>
                                <div className="flex-1 p-4 bg-slate-800/20 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 text-[10px] mb-1">إجمالي الرصيد</p>
                                    <p className="font-bold text-white">{data.liquidity.currentBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-48 flex justify-center">
                            <Pie data={liquidityData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>

                {/* Layer B: Debt Intelligence */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                            <Activity className="text-blue-500" /> مؤشر الديون
                        </h3>
                        <p className="text-slate-500 text-xs mb-8">تحليل نسبة الدين إلى الدخل الكلي</p>
                        
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-32 h-32 flex items-center justify-center border-4 border-slate-800 rounded-full">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{data.debt.debtToIncomeRatio}%</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">نسبة الدين</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">إجمالي المديونية</span>
                            <span className="font-bold text-white">{data.debt.totalDebtRemaining.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">أقساط قادمة</span>
                            <span className="font-bold text-blue-400">{data.debt.installmentsCount} قسط</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(data.debt.debtToIncomeRatio, 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Layer C: Spending Quality & D: Warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Spending Quality */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Target className="text-emerald-500" /> جودة الإنفاق (أعلى 5 بنود)
                    </h3>
                    <div className="space-y-4">
                        {data.quality.topExpenses.map((exp, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="text-xs text-slate-500 w-24 truncate">{exp.note}</div>
                                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${(exp.amount / data.quality.totalExpense) * 100}%` }}></div>
                                </div>
                                <div className="text-sm font-bold text-white">{exp.amount.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-sm">أنت تستهلك <span className="text-white font-bold">{data.quality.expenseRate}%</span> من دخلك الكلي</p>
                    </div>
                </div>

                {/* Intelligent Warnings */}
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Info className="text-orange-500" /> مساعدك الذكي يخبرك:
                    </h3>
                    <div className="space-y-4">
                        {data.warnings.length > 0 ? data.warnings.map((warn, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-800 border-r-4 border-r-orange-500">
                                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                                    {warn.type === 'loan' ? <Landmark size={18} /> : warn.type === 'card' ? <CreditCard size={18} /> : <Activity size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-200 font-bold">{warn.msg}</p>
                                    {warn.date && <p className="text-[10px] text-slate-500 mt-1">الموعد المتوقع: {new Date(warn.date).toLocaleDateString('ar-EG')}</p>}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <p className="text-slate-500">لا توجد تحذيرات حرجة حالياً. وضعك مستقر.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Final Touch: Recent Transactions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">سجل العمليات الأخيرة</h3>
                    <Link to="/expenses" className="text-blue-500 text-sm hover:underline flex items-center gap-1">المزيد <ChevronRight size={16} /></Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-slate-500 text-xs border-b border-slate-800">
                                <th className="pb-4 font-medium">البيان</th>
                                <th className="pb-4 font-medium">التاريخ</th>
                                <th className="pb-4 font-medium">النوع</th>
                                <th className="pb-4 font-medium">المبلغ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.recentTransactions.map((t, idx) => (
                                <tr key={idx} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 text-sm font-bold text-white">{t.note || t.source}</td>
                                    <td className="py-4 text-xs text-slate-500">{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'income' ? 'دخل' : 'مصروف'}
                                        </span>
                                    </td>
                                    <td className={`py-4 font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                        {t.amount.toLocaleString()} ج.م
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
