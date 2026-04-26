import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Wallet, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Landmark, Users, 
    TrendingUp, TrendingDown, Clock, 
    ChevronRight, AlertCircle, ShieldCheck,
    Plus, PieChart as PieIcon, Target, 
    ArrowRightCircle, CheckCircle2, Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
    Chart as ChartJS, ArcElement, Tooltip, Legend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [notifications, setNotifications] = useState([]); // أضفنا حالة للتنبيهات الحقيقية
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, transRes, notifRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/expenses/latest'),
                api.get('/notifications') // جلب التنبيهات الحقيقية من السيرفر
            ]);
            setStats(statsRes.data || {});
            setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
            setNotifications(Array.isArray(notifRes.data) ? notifRes.data.slice(0, 3) : []); // عرض آخر 3 تنبيهات
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    const topStats = stats?.topStats || {};
    const healthFactors = stats?.healthFactors || {};
    const distribution = stats?.distribution || {};

    const analysisMetrics = [
        { label: "معدل الادخار", value: `${healthFactors.savingsRate || 0}%`, color: "text-emerald-500", desc: "نسبة ما توفره من دخلك" },
        { label: "عبء الالتزامات", value: `${healthFactors.debtRatio || 0}%`, color: "text-red-500", desc: "نسبة الديون لإجمالي الدخل" },
        { label: "استخدام البطاقات", value: `${topStats.cardUsageRatio || 0}%`, color: "text-blue-500", desc: "نسبة المستهلك من حد الائتمان" },
        { label: "كفاية السيولة", value: `${healthFactors.liquidityScore || 0}%`, color: "text-emerald-400", desc: "قدرتك على تغطية الطوارئ" }
    ];

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">قمرة القيادة <span className="text-blue-500 text-xs not-italic bg-blue-500/10 px-3 py-1 rounded-full mr-2 uppercase">v2.6</span></h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">نظامك المالي الشامل (بيانات حقيقية لحظية)</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/notifications" className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative group hover:border-blue-500 transition-all">
                        <Bell className="text-slate-400 group-hover:text-blue-500" size={24} />
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                        )}
                    </Link>
                    <Link to="/expenses" className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/40 hover:scale-105 transition-all">
                        <Plus size={24} />
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                <SummaryCard label="التدفق النقدي الحالي" val={topStats.currentBalance} icon={<Wallet />} color="bg-blue-600" />
                <SummaryCard label="إجمالي الأصول" val={topStats.totalAssets} icon={<TrendingUp />} color="bg-emerald-600" />
                <SummaryCard label="إجمالي الالتزامات" val={topStats.totalObligations} icon={<Clock />} color="bg-red-600" />
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">نقاط القوة المالية</p>
                        <p className="text-3xl font-black text-blue-500">{topStats.healthScore || 0}</p>
                    </div>
                    <ShieldCheck className="text-blue-600" size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* التحليل المالي المتقدم */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3"><PieIcon className="text-blue-500" /> المحور الخامس: التحليل المالي</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {analysisMetrics.map((m, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{m.label}</p>
                                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                                <p className="text-[9px] text-slate-600 font-medium">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                        <p className="text-xs text-blue-400 font-bold flex items-center gap-2 mb-2">
                            <Target size={14} /> نصيحة "جيبي" الذكية
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                            {healthFactors.savingsRate < 20 
                                ? "معدل ادخارك منخفض حالياً. حاول تقليل فئات الرفاهية بنسبة 10% لرفع السيولة المتاحة." 
                                : "وضعك الادخاري ممتاز! يمكنك البدء في التفكير بفتح شهادة استثمار جديدة لزيادة العائد السلبي."}
                        </p>
                    </div>
                </div>

                {/* استحقاقات فعلية (المحور السادس) - DYNAMIC DATA */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] flex flex-col shadow-2xl">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2"><AlertCircle className="text-red-500" /> تنبيهات المحور السادس</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((n, i) => (
                                <div key={i} className={`p-4 rounded-2xl border transition-all ${n.isRead ? 'bg-slate-800/30 border-slate-800' : 'bg-blue-600/5 border-blue-500/20 shadow-lg'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-black text-white">{n.title}</p>
                                        <span className="text-[8px] text-slate-500 font-bold uppercase">{new Date(n.createdAt).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-20 italic text-xs">
                                <CheckCircle2 size={32} className="mb-2" />
                                لا توجد تنبيهات عاجلة حالياً
                            </div>
                        )}
                    </div>
                    <Link to="/notifications" className="mt-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs text-center transition-all">دخول مركز القرار الكامل</Link>
                </div>
            </div>

            <div className="mx-4 md:mx-0 p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full"></div>
                <div className="space-y-4 relative z-10">
                    <h3 className="text-2xl font-black text-white italic">تحليل السيولة (الفائض الحقيقي)</h3>
                    <p className="text-slate-500 text-sm max-w-md italic">هذا الرقم يحسب لك المبلغ المتبقي بعد طرح كافة الالتزامات والمدخرات المخطط لها.</p>
                </div>
                <div className="text-center md:text-left relative z-10">
                    <p className={`text-5xl font-black ${ (topStats.currentBalance - topStats.totalObligations) >= 0 ? 'text-emerald-500' : 'text-red-500' }`}>
                        {(topStats.currentBalance - topStats.totalObligations)?.toLocaleString() || 0} <span className="text-sm font-normal">ج.م</span>
                    </p>
                    <div className={`mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${ (topStats.currentBalance - topStats.totalObligations) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500' }`}>
                        {(topStats.currentBalance - topStats.totalObligations) >= 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {(topStats.currentBalance - topStats.totalObligations) >= 0 ? 'وضع مالي آمن' : 'تنبيه: عجز مالي متوقع'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ label, val, icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-blue-500/30 transition-all">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{(val || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
    </div>
);

export default Dashboard;
