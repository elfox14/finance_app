import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownLeft,
    DollarSign, Activity, Calendar, X,
    Receipt, Clock, Tag,
    ShieldCheck, PieChart as PieIcon, Landmark,
    Wallet, Users, CreditCard,
    List
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('income'); // 'income', 'expense', 'assets', 'liabilities'

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard');
            setStats(res.data || {});
        } catch (err) { 
            console.error('🔥 Dashboard Error:', err);
            setStats({});
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const { 
        accountingKPIs = {}, 
        currentMonthIncomesList = [], 
        currentMonthExpensesList = [],
        assetsDetailed = [],
        liabilitiesDetailed = []
    } = stats || {};
    
    const getModalData = () => {
        switch(modalType) {
            case 'income': return { title: 'تفاصيل الإيرادات', icon: <ArrowUpRight className="text-emerald-500" />, list: currentMonthIncomesList, color: 'emerald' };
            case 'expense': return { title: 'تفاصيل المصروفات', icon: <ArrowDownLeft className="text-red-500" />, list: currentMonthExpensesList, color: 'red' };
            case 'assets': return { title: 'تفاصيل الأصول الشخصية', icon: <Wallet className="text-emerald-500" />, list: assetsDetailed, color: 'emerald' };
            case 'liabilities': return { title: 'تفاصيل الالتزامات المالية', icon: <TrendingDown className="text-red-500" />, list: liabilitiesDetailed, color: 'red' };
            default: return { title: '', icon: null, list: [], color: 'blue' };
        }
    };

    const modalData = getModalData();
    const netFlow = accountingKPIs.operatingCashFlowMTD || 0;
    const isPositive = netFlow >= 0;

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">لوحة التحكم</h1>
                <p className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                    <Calendar size={12} /> ملخص الأداء المالي والمركز الحالي
                </p>
            </header>

            <div className="px-4 md:px-0">
                {/* 5 Key KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                    <KPICard 
                        label="الفائض/العجز الشهري" 
                        value={accountingKPIs.monthlySurplus} 
                        icon={<Activity size={18} />} 
                        color={accountingKPIs.monthlySurplus >= 0 ? 'text-emerald-500' : 'text-red-500'}
                    />
                    <KPICard 
                        label="نسبة الادخار" 
                        value={`${accountingKPIs.savingsRate}%`} 
                        icon={<PieIcon size={18} />} 
                        color={accountingKPIs.savingsRate >= 15 ? 'text-emerald-500' : 'text-orange-500'}
                    />
                    <KPICard 
                        label="الالتزامات القادمة" 
                        value={accountingKPIs.upcomingObligationsTotal} 
                        icon={<Clock size={18} />} 
                        color="text-orange-400"
                    />
                    <KPICard 
                        label="الأصول السائلة" 
                        value={accountingKPIs.liquidAssets} 
                        icon={<Wallet size={18} />} 
                        color="text-blue-400"
                    />
                    <KPICard 
                        label="التغير في الثروة" 
                        value={accountingKPIs.netWorthChange} 
                        icon={<TrendingUp size={18} />} 
                        color={accountingKPIs.netWorthChange >= 0 ? 'text-emerald-500' : 'text-red-500'}
                        isDelta
                    />
                </div>
            </div>

            <div className="px-4 md:px-0 grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Hero 1: Net Cash Flow (Monthly Performance) */}
                <section className={`relative overflow-hidden p-6 md:p-8 rounded-[2.5rem] border transition-all duration-500 ${
                    isPositive 
                    ? 'bg-emerald-600/10 border-emerald-500/20' 
                    : 'bg-red-600/10 border-red-500/20'
                } shadow-xl flex flex-col justify-between min-h-[320px]`}>
                    
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                        <Activity size={300} className={`absolute -bottom-10 -left-10 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                    </div>

                    <div className="relative z-10">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">صافي التدفق النقدي للفترة</p>
                        <div className="flex items-center gap-4">
                            <h2 className={`text-4xl md:text-5xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>
                                {Math.abs(netFlow).toLocaleString()}
                                <span className="text-lg ml-2 opacity-50">ج.م</span>
                            </h2>
                            <div className={`p-2 rounded-2xl ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-3 mt-8">
                        <button 
                            onClick={() => { setModalType('income'); setShowModal(true); }}
                            className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl text-right hover:bg-emerald-500/10 transition-all group/card"
                        >
                            <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
                                <ArrowUpRight size={14} />
                                <span className="text-[9px] font-black uppercase">الإيرادات</span>
                            </div>
                            <p className="text-lg font-black text-white group-hover/card:translate-x-1 transition-transform">{(accountingKPIs.incomeMTD || 0).toLocaleString()}</p>
                        </button>

                        <button 
                            onClick={() => { setModalType('expense'); setShowModal(true); }}
                            className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl text-right hover:bg-red-500/10 transition-all group/card"
                        >
                            <div className="flex items-center gap-1.5 mb-1 text-red-500">
                                <ArrowDownLeft size={14} />
                                <span className="text-[9px] font-black uppercase">المصروفات</span>
                            </div>
                            <p className="text-lg font-black text-white group-hover/card:translate-x-1 transition-transform">{(accountingKPIs.expensesMTD || 0).toLocaleString()}</p>
                        </button>
                    </div>
                </section>

                {/* Hero 2: Net Worth Hero */}
                <section className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[320px] group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={180} className="text-blue-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-slate-500 font-bold uppercase text-[10px] mb-4 tracking-widest">صافي الثروة الحالية (Net Worth)</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                            {(accountingKPIs.netWorth || 0).toLocaleString()}
                            <span className="text-lg ml-2 opacity-50">ج.م</span>
                        </h2>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-3 mt-8">
                        <button 
                            onClick={() => { setModalType('assets'); setShowModal(true); }}
                            className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-3xl hover:bg-emerald-500/10 transition-all text-right group/btn"
                        >
                            <p className="text-[9px] text-emerald-500 font-black uppercase mb-1 flex items-center gap-1">
                                إجمالي الأصول <List size={10} />
                            </p>
                            <p className="text-lg font-black text-white group-hover/btn:translate-x-1 transition-transform">{(accountingKPIs.totalAssets || 0).toLocaleString()}</p>
                        </button>
                        <button 
                            onClick={() => { setModalType('liabilities'); setShowModal(true); }}
                            className="bg-red-500/5 border border-red-500/20 p-4 rounded-3xl hover:bg-red-500/10 transition-all text-right group/btn"
                        >
                            <p className="text-[9px] text-red-500 font-black uppercase mb-1 flex items-center gap-1">
                                الالتزامات <List size={10} />
                            </p>
                            <p className="text-lg font-black text-white group-hover/btn:translate-x-1 transition-transform">{(accountingKPIs.totalLiabilities || 0).toLocaleString()}</p>
                        </button>
                    </div>
                </section>

            </div>

            {/* Global Details Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-6 md:p-10 relative shadow-2xl overflow-y-auto max-h-[85vh] no-scrollbar text-right" dir="rtl">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <X size={28} />
                        </button>
                        
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            {modalData.icon} {modalData.title}
                        </h2>

                        <div className="space-y-3">
                            {modalData.list.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-white/5 transition-all group`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                                            modalData.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {item.icon === 'certificate' ? <Landmark size={20} /> : 
                                             item.icon === 'debt' ? <Users size={20} /> : 
                                             item.icon === 'card' ? <CreditCard size={20} /> :
                                             item.icon === 'loan' ? <Landmark size={20} /> :
                                             item.icon === 'account' ? <DollarSign size={20} /> :
                                             <Receipt size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-white">{item.name || item.category || 'عام'}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                    {item.type ? item.type.replace('_', ' ') : new Date(item.date).toLocaleDateString('ar-EG')}
                                                </span>
                                                {item.counterparty && (
                                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                        <Tag size={10} /> {item.counterparty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-xl font-black ${modalData.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {(item.value || item.amount || 0).toLocaleString()} 
                                        <span className="text-[10px] opacity-50 ml-2">ج.م</span>
                                    </p>
                                </div>
                            ))}
                            {modalData.list.length === 0 && (
                                <div className="py-16 text-center text-slate-500 italic text-base">لا توجد بيانات مسجلة في هذا القسم</div>
                            )}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                             <p className="text-slate-500 text-sm font-bold">الإجمالي المجمع</p>
                             <p className={`text-2xl font-black ${modalData.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {modalType === 'income' ? (accountingKPIs.incomeMTD || 0).toLocaleString() :
                                 modalType === 'expense' ? (accountingKPIs.expensesMTD || 0).toLocaleString() :
                                 modalType === 'assets' ? (accountingKPIs.totalAssets || 0).toLocaleString() :
                                 (accountingKPIs.totalLiabilities || 0).toLocaleString()} ج.م
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ label, value, icon, color, isDelta }) => (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-xl bg-slate-800 ${color.replace('text-', 'bg-')}/10 ${color}`}>
                {icon}
            </div>
            {isDelta && (
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${parseFloat(value) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {parseFloat(value) >= 0 ? '+ ' : ''} هذا الشهر
                </span>
            )}
        </div>
        <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">{label}</p>
            <p className={`text-xl font-black truncate ${color}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
                {typeof value === 'number' && <span className="text-[10px] ml-1 opacity-50">ج.م</span>}
            </p>
        </div>
    </div>
);

export default Dashboard;
