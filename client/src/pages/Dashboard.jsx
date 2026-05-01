import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownLeft,
    DollarSign, Activity, Calendar, X,
    Receipt, Clock, Tag,
    ShieldCheck, PieChart as PieIcon, Landmark,
    Wallet, Users, CreditCard,
    List, ChevronLeft
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('income'); // 'income', 'expense', 'assets', 'liabilities', 'financing'

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
        financingDetailed = [],
        assetsDetailed = [],
        liabilitiesDetailed = []
    } = stats || {};
    
    const getModalData = () => {
        switch(modalType) {
            case 'income': return { title: 'تفاصيل الإيرادات', icon: <ArrowUpRight className="text-emerald-500" />, list: currentMonthIncomesList, color: 'emerald' };
            case 'expense': return { title: 'تفاصيل المصروفات', icon: <ArrowDownLeft className="text-red-500" />, list: currentMonthExpensesList, color: 'red' };
            case 'assets': return { title: 'تفاصيل الأصول الشخصية', icon: <Wallet className="text-emerald-500" />, list: assetsDetailed, color: 'emerald' };
            case 'liabilities': return { title: 'تفاصيل الالتزامات المالية', icon: <TrendingDown className="text-red-500" />, list: liabilitiesDetailed, color: 'red' };
            case 'financing': return { title: 'تغيرات التمويل والديون', icon: <Activity className="text-blue-500" />, list: financingDetailed, color: 'blue' };
            default: return { title: '', icon: null, list: [], color: 'blue' };
        }
    };

    const modalData = getModalData();
    const netFlow = accountingKPIs.operatingCashFlowMTD || 0;
    const isPositive = netFlow >= 0;

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">قمرة القيادة</h1>
                <p className="text-slate-500 text-xs md:text-sm mt-1 md:mt-2 flex items-center gap-2">
                    <Calendar size={14} /> ملخص الأداء المالي والمركز الحالي الذكي
                </p>
            </header>

            <div className="px-4 md:px-0 space-y-8 md:space-y-10">
                
                {/* 5 Key KPI Cards - Optimized for Mobile Grid */}
                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    <KPICard 
                        label="الفائض/العجز" 
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
                        label="التزامات قادمة" 
                        value={accountingKPIs.upcomingObligationsTotal} 
                        icon={<Clock size={18} />} 
                        color="text-orange-400"
                    />
                    <KPICard 
                        label="أصول سائلة" 
                        value={accountingKPIs.liquidAssets} 
                        icon={<Wallet size={18} />} 
                        color="text-blue-400"
                    />
                    <KPICard 
                        label="تغير الثروة" 
                        value={accountingKPIs.netWorthChange} 
                        icon={<TrendingUp size={18} />} 
                        color={accountingKPIs.netWorthChange >= 0 ? 'text-emerald-500' : 'text-red-500'}
                        isDelta
                    />
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* Hero 1: Net Cash Flow */}
                    <section className={`relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border transition-all duration-500 ${
                        isPositive 
                        ? 'bg-emerald-600/10 border-emerald-500/20 shadow-emerald-900/10' 
                        : 'bg-red-600/10 border-red-500/20 shadow-red-900/10'
                    } shadow-2xl flex flex-col justify-between min-h-[300px] md:min-h-[360px]`}>
                        
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <Activity size={350} className={`absolute -bottom-10 -left-10 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>

                        <div className="relative z-10 text-center md:text-right">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-3 md:mb-5">صافي التدفق النقدي للفترة</p>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <h2 className={`text-5xl md:text-7xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>
                                    {Math.abs(netFlow).toLocaleString()}
                                    <span className="text-xl md:text-2xl ml-2 opacity-50 font-bold">ج.م</span>
                                </h2>
                                <div className={`p-3 rounded-2xl ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {isPositive ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                                </div>
                            </div>
                            <p className={`text-sm md:text-base font-bold mt-4 md:mt-6 ${isPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                                {isPositive ? 'أداء إيجابي: إيراداتك تتجاوز مصروفاتك' : 'تنبيه: مصروفاتك تتجاوز إيراداتك'}
                            </p>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-8">
                            <button 
                                onClick={() => { setModalType('income'); setShowModal(true); }}
                                className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-right hover:bg-emerald-500/10 transition-all group/card shadow-lg"
                            >
                                <div className="flex items-center gap-2 mb-1.5 text-emerald-500">
                                    <ArrowUpRight size={16} />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase">إيرادات حقيقية</span>
                                </div>
                                <p className="text-xl md:text-2xl font-black text-white group-hover/card:translate-x-1 transition-transform">{(accountingKPIs.incomeMTD || 0).toLocaleString()}</p>
                            </button>

                            <button 
                                onClick={() => { setModalType('expense'); setShowModal(true); }}
                                className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-right hover:bg-red-500/10 transition-all group/card shadow-lg"
                            >
                                <div className="flex items-center gap-2 mb-1.5 text-red-500">
                                    <ArrowDownLeft size={16} />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase">مصروفات تشغيلية</span>
                                </div>
                                <p className="text-xl md:text-2xl font-black text-white group-hover/card:translate-x-1 transition-transform">{(accountingKPIs.expensesMTD || 0).toLocaleString()}</p>
                            </button>

                            <button 
                                onClick={() => { setModalType('financing'); setShowModal(true); }}
                                className="col-span-2 lg:col-span-1 bg-slate-950/40 backdrop-blur-md border border-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-right hover:bg-blue-500/10 transition-all group/card shadow-lg"
                            >
                                <div className="flex items-center gap-2 mb-1.5 text-blue-400">
                                    <Activity size={16} />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase">تغيرات التمويل</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xl md:text-2xl font-black text-white group-hover/card:translate-x-1 transition-transform">{(accountingKPIs.financingMTD || 0).toLocaleString()}</p>
                                    <span className={`text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-full ${accountingKPIs.financingMTD >= 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {accountingKPIs.financingMTD >= 0 ? 'زيادة التزام' : 'سداد ديون'}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </section>

                    {/* Hero 2: Net Worth */}
                    <section className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] md:min-h-[360px] group">
                        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={250} className="text-blue-500" />
                        </div>
                        
                        <div className="relative z-10 text-center md:text-right">
                            <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs mb-3 md:mb-5 tracking-widest">صافي الثروة الحالية (Net Worth)</p>
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                                {(accountingKPIs.netWorth || 0).toLocaleString()}
                                <span className="text-xl md:text-2xl ml-2 opacity-50 font-bold">ج.م</span>
                            </h2>
                            <p className="text-blue-400/60 font-bold mt-4 md:mt-6 text-sm flex items-center justify-center md:justify-start gap-2">
                                <ShieldCheck size={16} /> أمانك المالي الشامل
                            </p>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-4 mt-8">
                            <button 
                                onClick={() => { setModalType('assets'); setShowModal(true); }}
                                className="bg-emerald-500/5 border border-emerald-500/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:bg-emerald-500/10 transition-all text-right group/btn shadow-lg"
                            >
                                <p className="text-[9px] md:text-[10px] text-emerald-500 font-black uppercase mb-1.5 flex items-center gap-1">
                                    إجمالي الأصول <List size={12} />
                                </p>
                                <p className="text-xl md:text-2xl font-black text-white group-hover/btn:translate-x-1 transition-transform">{(accountingKPIs.totalAssets || 0).toLocaleString()}</p>
                            </button>
                            <button 
                                onClick={() => { setModalType('liabilities'); setShowModal(true); }}
                                className="bg-red-500/5 border border-red-500/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] hover:bg-red-500/10 transition-all text-right group/btn shadow-lg"
                            >
                                <p className="text-[9px] md:text-[10px] text-red-500 font-black uppercase mb-1.5 flex items-center gap-1">
                                    الالتزامات <List size={12} />
                                </p>
                                <p className="text-xl md:text-2xl font-black text-white group-hover/btn:translate-x-1 transition-transform">{(accountingKPIs.totalLiabilities || 0).toLocaleString()}</p>
                            </button>
                        </div>
                    </section>

                </div>

                <section className="py-10 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-600 bg-slate-900/30 px-6 py-3 rounded-full border border-slate-800/50">
                        <Activity size={16} />
                        <span className="text-xs font-bold italic tracking-wide">يتم تنظيم باقي الأقسام تباعاً لضمان أفضل تجربة مستخدم</span>
                    </div>
                </section>

            </div>

            {/* Global Details Modal - Fully Mobile Optimized */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="bg-slate-950 border-t md:border border-white/10 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-6 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] md:max-h-[85vh] no-scrollbar text-right" dir="rtl">
                        
                        {/* Mobile Pull Indicator */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 md:hidden"></div>

                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-6 left-6 md:top-10 md:left-10 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <X size={28} className="md:w-8 md:h-8" />
                        </button>
                        
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-8 md:mb-12 flex items-center gap-3 md:gap-4">
                            {modalData.icon} {modalData.title}
                        </h2>

                        <div className="space-y-3 md:space-y-4">
                            {modalData.list.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 md:p-6 bg-slate-900/50 rounded-2xl md:rounded-3xl border border-white/5 transition-all group`}>
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110 ${
                                            modalData.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            modalData.color === 'red' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {item.icon === 'certificate' ? <Landmark size={20} className="md:w-6 md:h-6" /> : 
                                             item.icon === 'debt' ? <Users size={20} className="md:w-6 md:h-6" /> : 
                                             item.icon === 'card' ? <CreditCard size={20} className="md:w-6 md:h-6" /> :
                                             item.icon === 'loan' ? <Landmark size={20} className="md:w-6 md:h-6" /> :
                                             item.icon === 'account' ? <DollarSign size={20} className="md:w-6 md:h-6" /> :
                                             <Receipt size={20} className="md:w-6 md:h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm md:text-lg font-black text-white leading-tight">{item.name || item.category || 'عام'}</p>
                                            <div className="flex items-center gap-2 md:gap-3 mt-1">
                                                <span className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                                                    {item.type ? item.type.replace('_', ' ') : new Date(item.date).toLocaleDateString('ar-EG')}
                                                </span>
                                                {item.counterparty && (
                                                    <span className="text-[9px] md:text-xs text-slate-500 font-bold flex items-center gap-1">
                                                        <Tag size={10} /> {item.counterparty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-lg md:text-2xl font-black ${
                                        modalData.color === 'emerald' ? 'text-emerald-400' : 
                                        modalData.color === 'red' ? 'text-red-400' : 'text-blue-400'
                                    }`}>
                                        {(item.value || item.amount || 0).toLocaleString()} 
                                        <span className="text-[10px] md:text-xs opacity-50 ml-1 md:ml-2">ج.م</span>
                                    </p>
                                </div>
                            ))}
                            {modalData.list.length === 0 && (
                                <div className="py-16 md:py-20 text-center text-slate-500 italic text-base">لا توجد بيانات مسجلة في هذا القسم</div>
                            )}
                        </div>
                        
                        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-800 flex justify-between items-center">
                             <p className="text-slate-500 text-xs md:text-sm font-bold italic">الإجمالي المجمع للفئة</p>
                             <p className={`text-2xl md:text-4xl font-black ${
                                 modalData.color === 'emerald' ? 'text-emerald-400' : 
                                 modalData.color === 'red' ? 'text-red-400' : 'text-blue-400'
                             }`}>
                                {modalType === 'income' ? (accountingKPIs.incomeMTD || 0).toLocaleString() :
                                 modalType === 'expense' ? (accountingKPIs.expensesMTD || 0).toLocaleString() :
                                 modalType === 'financing' ? (accountingKPIs.financingMTD || 0).toLocaleString() :
                                 modalType === 'assets' ? (accountingKPIs.totalAssets || 0).toLocaleString() :
                                 (accountingKPIs.totalLiabilities || 0).toLocaleString()} <span className="text-xs md:text-lg ml-1">ج.م</span>
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ label, value, icon, color, isDelta }) => (
    <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-[1.5rem] md:rounded-3xl shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group overflow-hidden">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2 rounded-xl bg-slate-800 ${color.replace('text-', 'bg-')}/10 ${color}`}>
                {icon}
            </div>
            {isDelta && (
                <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${parseFloat(value) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {parseFloat(value) >= 0 ? '+ ' : ''} النمو
                </span>
            )}
        </div>
        <div>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-0.5 md:mb-1">{label}</p>
            <p className={`text-lg md:text-xl font-black truncate ${color}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
                {typeof value === 'number' && <span className="text-[8px] md:text-[10px] ml-1 opacity-50 font-bold">ج.م</span>}
            </p>
        </div>
    </div>
);

export default Dashboard;
