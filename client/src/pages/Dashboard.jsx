import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownLeft,
    DollarSign, Activity, Calendar, X,
    Receipt, Clock, Tag
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('income'); // 'income' or 'expense'

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
        currentMonthExpensesList = [] 
    } = stats || {};
    
    const activeList = modalType === 'income' ? currentMonthIncomesList : currentMonthExpensesList;
    
    const netFlow = accountingKPIs.operatingCashFlowMTD || 0;
    const isPositive = netFlow >= 0;

    return (
        <div className="space-y-12 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">لوحة التحكم</h1>
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                    <Calendar size={14} /> ملخص الأداء المالي للشهر الحالي
                </p>
            </header>

            <div className="px-4 md:px-0 grid grid-cols-1 gap-8">
                
                {/* Net Cash Flow Section - Hero Card */}
                <section>
                    <div className={`relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] border transition-all duration-500 ${
                        isPositive 
                        ? 'bg-emerald-600/10 border-emerald-500/20 shadow-emerald-900/10' 
                        : 'bg-red-600/10 border-red-500/20 shadow-red-900/10'
                    } shadow-2xl`}>
                        
                        {/* Background Decoration */}
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

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                                <button 
                                    onClick={() => { setModalType('income'); setShowModal(true); }}
                                    className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] min-w-[200px] text-right hover:bg-emerald-500/10 transition-all group/card"
                                >
                                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                                        <ArrowUpRight size={18} />
                                        <span className="text-[10px] font-black uppercase">إجمالي الإيرادات</span>
                                    </div>
                                    <p className="text-2xl font-black text-white group-hover/card:scale-105 transition-transform">{(accountingKPIs.incomeMTD || 0).toLocaleString()}</p>
                                </button>

                                <button 
                                    onClick={() => { setModalType('expense'); setShowModal(true); }}
                                    className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] min-w-[200px] text-right hover:bg-red-500/10 transition-all group/card"
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

                {/* Placeholder for future sections */}
                <section className="py-20 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-600 bg-slate-900/30 px-6 py-3 rounded-full border border-slate-800/50">
                        <Activity size={16} />
                        <span className="text-xs font-bold italic">سيتم إضافة باقي الأقسام تباعاً لتنظيم اللوحة بشكل مثالي</span>
                    </div>
                </section>

            </div>

            {/* Transaction List Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-white/10 w-full max-w-2xl rounded-[3rem] p-8 md:p-10 relative shadow-2xl overflow-y-auto max-h-[85vh] no-scrollbar text-right" dir="rtl">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={28} />
                        </button>
                        
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            {modalType === 'income' ? (
                                <><ArrowUpRight className="text-emerald-500" /> تفاصيل الإيرادات</>
                            ) : (
                                <><ArrowDownLeft className="text-red-500" /> تفاصيل المصروفات</>
                            )}
                        </h2>

                        <div className="space-y-4">
                            {activeList.map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${modalType === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <Receipt size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{tx.category || 'عام'}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(tx.date).toLocaleDateString('ar-EG')}
                                                </span>
                                                {tx.counterparty && (
                                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                        <Tag size={12} /> {tx.counterparty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-xl font-black ${modalType === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {tx.amount.toLocaleString()} <span className="text-xs opacity-50">ج.م</span>
                                    </p>
                                </div>
                            ))}
                            {activeList.length === 0 && (
                                <div className="py-20 text-center text-slate-500 italic">لا توجد عمليات مسجلة في هذه الفئة لهذا الشهر</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
