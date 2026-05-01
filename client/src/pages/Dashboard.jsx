import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownLeft,
    DollarSign, Activity, Calendar, X,
    Receipt, Clock, Tag,
    ShieldCheck, PieChart as PieIcon, Landmark,
    Wallet, Users, CreditCard,
    ChevronLeft, List
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
    
    // Modal Logic
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
        <div className="space-y-12 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">لوحة التحكم</h1>
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                    <Calendar size={14} /> ملخص الأداء المالي والمركز الحالي
                </p>
            </header>

            <div className="px-4 md:px-0 space-y-10">
                
                {/* Section 1: Net Cash Flow (Monthly Performance) */}
                <section>
                    <div className={`relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] border transition-all duration-500 ${
                        isPositive 
                        ? 'bg-emerald-600/10 border-emerald-500/20 shadow-emerald-900/10' 
                        : 'bg-red-600/10 border-red-500/20 shadow-red-900/10'
                    } shadow-2xl`}>
                        
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <Activity size={400} className={`absolute -bottom-20 -left-20 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="text-center md:text-right flex-1">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">صافي التدفق النقدي للفترة</p>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h2 className={`text-6xl md:text-8xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>
                                        {Math.abs(netFlow).toLocaleString()}
                                        <span className="text-2xl md:text-3xl ml-3 opacity-50">ج.م</span>
                                    </h2>
                                    <div className={`p-4 rounded-3xl ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {isPositive ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
                                    </div>
                                </div>
                                <p className={`text-lg font-bold mt-6 ${isPositive ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                                    {isPositive ? 'أداء إيجابي: إيراداتك تتجاوز مصروفاتك' : 'تنبيه: مصروفاتك تتجاوز إيراداتك لهذا الشهر'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                                <button 
                                    onClick={() => { setModalType('income'); setShowModal(true); }}
                                    className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] min-w-[200px] text-right hover:bg-emerald-500/10 transition-all group/card"
                                >
                                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                                        <ArrowUpRight size={18} />
                                        <span className="text-[10px] font-black uppercase">إجمالي الإيرادات</span>
                                    </div>
                                    <p className="text-2xl font-black text-white group-hover/card:scale-105 transition-transform">{(accountingKPIs.incomeMTD || 0).toLocaleString()}</p>
                                </button>

                                <button 
                                    onClick={() => { setModalType('expense'); setShowModal(true); }}
                                    className="bg-slate-950/40 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] min-w-[200px] text-right hover:bg-red-500/10 transition-all group/card"
                                >
                                    <div className="flex items-center gap-2 mb-2 text-red-500">
                                        <ArrowDownLeft size={18} />
                                        <span className="text-[10px] font-black uppercase">إجمالي المصروفات</span>
                                    </div>
                                    <p className="text-2xl font-black text-white group-hover/card:scale-105 transition-transform">{(accountingKPIs.expensesMTD || 0).toLocaleString()}</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Net Worth Hero (With Asset/Liability Toggles) */}
                <section>
                    <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={200} className="text-blue-500" />
                        </div>
                        
                        <div className="relative z-10 flex-1 text-center md:text-right">
                            <p className="text-slate-500 font-bold uppercase text-xs mb-3 tracking-widest">صافي الثروة الحالية (Net Worth)</p>
                            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                                {(accountingKPIs.netWorth || 0).toLocaleString()}
                                <span className="text-2xl md:text-3xl ml-3 opacity-50">ج.م</span>
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                                <button 
                                    onClick={() => { setModalType('assets'); setShowModal(true); }}
                                    className="bg-emerald-500/5 border border-emerald-500/20 px-8 py-4 rounded-[2rem] hover:bg-emerald-500/10 transition-all text-right group/btn"
                                >
                                    <p className="text-[10px] text-emerald-500 font-black uppercase mb-1 flex items-center gap-1">
                                        إجمالي الأصول <List size={10} />
                                    </p>
                                    <p className="text-2xl font-black text-white group-hover/btn:translate-x-1 transition-transform">{(accountingKPIs.totalAssets || 0).toLocaleString()}</p>
                                </button>
                                <button 
                                    onClick={() => { setModalType('liabilities'); setShowModal(true); }}
                                    className="bg-red-500/5 border border-red-500/20 px-8 py-4 rounded-[2rem] hover:bg-red-500/10 transition-all text-right group/btn"
                                >
                                    <p className="text-[10px] text-red-500 font-black uppercase mb-1 flex items-center gap-1">
                                        إجمالي الالتزامات <List size={10} />
                                    </p>
                                    <p className="text-2xl font-black text-white group-hover/btn:translate-x-1 transition-transform">{(accountingKPIs.totalLiabilities || 0).toLocaleString()}</p>
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 hidden lg:block">
                            <div className="w-40 h-40 bg-blue-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 rotate-6 group-hover:rotate-12 transition-all">
                                <PieIcon size={64} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-10 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-600 bg-slate-900/30 px-6 py-3 rounded-full border border-slate-800/50">
                        <Activity size={16} />
                        <span className="text-xs font-bold italic">يتم تنظيم باقي الأقسام تباعاً لتنظيم اللوحة بشكل مثالي</span>
                    </div>
                </section>

            </div>

            {/* Global Details Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-white/10 w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[85vh] no-scrollbar text-right" dir="rtl">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-10 left-10 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <X size={32} />
                        </button>
                        
                        <h2 className="text-3xl font-black text-white mb-10 flex items-center gap-4">
                            {modalData.icon} {modalData.title}
                        </h2>

                        <div className="space-y-4">
                            {modalData.list.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-white/5 transition-all group`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                                            modalData.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {item.icon === 'certificate' ? <Landmark size={24} /> : 
                                             item.icon === 'debt' ? <Users size={24} /> : 
                                             item.icon === 'card' ? <CreditCard size={24} /> :
                                             item.icon === 'loan' ? <Landmark size={24} /> :
                                             item.icon === 'account' ? <DollarSign size={24} /> :
                                             <Receipt size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white">{item.name || item.category || 'عام'}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                                    {item.type ? item.type.replace('_', ' ') : new Date(item.date).toLocaleDateString('ar-EG')}
                                                </span>
                                                {item.counterparty && (
                                                    <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                                        <Tag size={12} /> {item.counterparty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-2xl font-black ${modalData.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {(item.value || item.amount || 0).toLocaleString()} 
                                        <span className="text-xs opacity-50 ml-2">ج.م</span>
                                    </p>
                                </div>
                            ))}
                            {modalData.list.length === 0 && (
                                <div className="py-20 text-center text-slate-500 italic text-lg">لا توجد بيانات مسجلة في هذا القسم</div>
                            )}
                        </div>
                        
                        <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center">
                             <p className="text-slate-500 font-bold">الإجمالي المجمع</p>
                             <p className={`text-3xl font-black ${modalData.color === 'emerald' ? 'text-emerald-400' : 'text-red-400'}`}>
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

export default Dashboard;
