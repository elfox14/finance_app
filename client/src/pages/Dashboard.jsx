import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownLeft,
    DollarSign, Activity, Calendar, X,
    Receipt, Clock, Tag, Percent,
    ShieldCheck, PieChart as PieIcon, Landmark,
    Wallet, Users, CreditCard, Zap,
    List, Lightbulb, AlertTriangle, Heart,
    Banknote, Shield, BarChart3
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');

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
        summary = {}, 
        performance = {}, 
        ratios = {}, 
        details = {}, 
        netWorthBreakdown = {}, 
        insights = [], 
        upcomingObligations = [] 
    } = stats || {};

    const getModalData = () => {
        switch(modalType) {
            case 'opIncome': return { title: 'إيرادات تشغيلية', icon: <ArrowDownLeft className="text-emerald-500" />, list: details.operatingIncomeList || [], color: 'emerald', total: performance.operatingIncome };
            case 'opExpense': return { title: 'مصروفات تشغيلية', icon: <ArrowUpRight className="text-red-500" />, list: details.operatingExpenseList || [], color: 'red', total: performance.operatingExpense };
            case 'finIn': return { title: 'تمويل وارد', icon: <Landmark className="text-blue-500" />, list: details.financingInList || [], color: 'blue', total: performance.financingIn };
            case 'debtPay': return { title: 'سداد ديون', icon: <Shield className="text-orange-500" />, list: details.debtPaymentList || [], color: 'orange', total: performance.debtPrincipalPayment };
            case 'finCost': return { title: 'فوائد وعمولات', icon: <Percent className="text-rose-500" />, list: details.financeCostList || [], color: 'rose', total: performance.financeCost };
            case 'assets': return { title: 'تفاصيل الأصول', icon: <Wallet className="text-emerald-500" />, list: details.assetsDetailed || [], color: 'emerald', total: netWorthBreakdown.totalAssets };
            case 'liabilities': return { title: 'تفاصيل الالتزامات', icon: <TrendingDown className="text-red-500" />, list: details.liabilitiesDetailed || [], color: 'red', total: netWorthBreakdown.totalLiabilities };
            default: return { title: '', icon: null, list: [], color: 'blue', total: 0 };
        }
    };

    const modalData = getModalData();
    const isPositiveCF = (summary.operatingCashFlow || 0) >= 0;

    const openModal = (type) => { setModalType(type); setShowModal(true); };

    return (
        <div className="space-y-8 md:space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">قمرة القيادة</h1>
                <p className="text-slate-500 text-xs md:text-sm mt-1 md:mt-2 flex items-center gap-2">
                    <Calendar size={14} /> المركز المالي والأداء التشغيلي
                </p>
            </header>

            <div className="px-4 md:px-0 space-y-8 md:space-y-10">

                {/* ═══════════════════════════════════════════════════ */}
                {/* ROW 1: ملخص اليوم — 4 بطاقات رئيسية               */}
                {/* ═══════════════════════════════════════════════════ */}
                <section>
                    <SectionLabel text="ملخص اليوم" icon={<Zap size={14} />} />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <HeroCard 
                            label="صافي السيولة" value={summary.liquidAssets}
                            icon={<Wallet size={20} />} color="blue"
                            sub="النقدية + البنك + المحافظ"
                        />
                        <HeroCard 
                            label="التدفق النقدي" value={summary.operatingCashFlow}
                            icon={<Activity size={20} />} 
                            color={isPositiveCF ? 'emerald' : 'red'}
                            sub="إيرادات − مصروفات − فوائد"
                            signed
                        />
                        <HeroCard 
                            label="صافي الثروة" value={summary.netWorth}
                            icon={<ShieldCheck size={20} />} 
                            color={summary.netWorth >= 0 ? 'emerald' : 'red'}
                            sub="الأصول − الالتزامات"
                            onClick={() => openModal('assets')}
                            signed
                        />
                        <HeroCard 
                            label="الالتزامات القائمة" value={summary.outstandingObligations}
                            icon={<AlertTriangle size={20} />} color="orange"
                            sub="قروض + بطاقات + سلف + جمعيات"
                            onClick={() => openModal('liabilities')}
                        />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════ */}
                {/* ROW 2: أداء الشهر — 5 بطاقات سبب التغير            */}
                {/* ═══════════════════════════════════════════════════ */}
                <section>
                    <SectionLabel text="أداء الشهر" icon={<BarChart3 size={14} />} />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                        <DriverCard 
                            label="إيرادات تشغيلية" value={performance.operatingIncome}
                            icon={<ArrowDownLeft size={16} />} color="emerald"
                            onClick={() => openModal('opIncome')}
                        />
                        <DriverCard 
                            label="مصروفات تشغيلية" value={performance.operatingExpense}
                            icon={<ArrowUpRight size={16} />} color="red"
                            onClick={() => openModal('opExpense')}
                        />
                        <DriverCard 
                            label="تمويل وارد" value={performance.financingIn}
                            icon={<Landmark size={16} />} color="blue"
                            onClick={() => openModal('finIn')}
                        />
                        <DriverCard 
                            label="سداد ديون" value={performance.debtPrincipalPayment}
                            icon={<Shield size={16} />} color="orange"
                            onClick={() => openModal('debtPay')}
                        />
                        <DriverCard 
                            label="فوائد وعمولات" value={performance.financeCost}
                            icon={<Percent size={16} />} color="rose"
                            className="col-span-2 md:col-span-1"
                            onClick={() => openModal('finCost')}
                        />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════ */}
                {/* ROW 3: قراءة وضعك المالي — 4 مؤشرات + رسائل ذكية  */}
                {/* ═══════════════════════════════════════════════════ */}
                <section>
                    <SectionLabel text="قراءة وضعك المالي" icon={<Lightbulb size={14} />} />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <IndicatorCard 
                            label="نسبة الادخار" 
                            value={`${ratios.savingsRate || 0}%`}
                            icon={<PieIcon size={16} />}
                            status={ratios.savingsRate >= 20 ? 'good' : ratios.savingsRate >= 10 ? 'ok' : 'bad'}
                            hint={ratios.savingsRate >= 20 ? 'ممتاز' : ratios.savingsRate >= 10 ? 'مقبول' : 'ضعيف'}
                        />
                        <IndicatorCard 
                            label="الالتزامات / الدخل" 
                            value={`${ratios.debtToIncomeRatio || 0}%`}
                            icon={<Heart size={16} />}
                            status={ratios.debtToIncomeRatio <= 30 ? 'good' : ratios.debtToIncomeRatio <= 50 ? 'ok' : 'bad'}
                            hint={ratios.debtToIncomeRatio <= 30 ? 'آمن' : ratios.debtToIncomeRatio <= 50 ? 'مرتفع' : 'خطر'}
                        />
                        <IndicatorCard 
                            label="تغير الثروة" 
                            value={ratios.netWorthChange || 0}
                            icon={<TrendingUp size={16} />}
                            status={ratios.netWorthChange >= 0 ? 'good' : 'bad'}
                            isAmount
                        />
                        <IndicatorCard 
                            label="تغطية نقدية" 
                            value={`${ratios.cashCoverageMonths || 0} شهر`}
                            icon={<Clock size={16} />}
                            status={ratios.cashCoverageMonths >= 3 ? 'good' : ratios.cashCoverageMonths >= 1 ? 'ok' : 'bad'}
                            hint={ratios.cashCoverageMonths >= 3 ? 'مستقر' : ratios.cashCoverageMonths >= 1 ? 'حذر' : 'حرج'}
                        />
                    </div>

                    {/* Smart Insights */}
                    {insights.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {insights.slice(0, 3).map((text, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                                    <Lightbulb size={16} className="text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-slate-300 font-bold leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ═══════════════════════════════════════════════════ */}
                {/* ROW 4: التزامات قادمة                               */}
                {/* ═══════════════════════════════════════════════════ */}
                {upcomingObligations.length > 0 && (
                    <section>
                        <SectionLabel text="التزامات قادمة" icon={<Clock size={14} />} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {upcomingObligations.map((ob, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${ob.type === 'loan' ? 'bg-blue-500/10 text-blue-500' : ob.type === 'card' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {ob.type === 'loan' ? <Landmark size={16}/> : ob.type === 'card' ? <CreditCard size={16}/> : <Users size={16}/>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{ob.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{new Date(ob.dueDate).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-black text-white">{(ob.amount || 0).toLocaleString()} <span className="text-[9px] opacity-50">ج.م</span></p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* MODAL                                              */}
            {/* ═══════════════════════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md">
                    <div className="bg-slate-950 border-t md:border border-white/10 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-6 md:p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] md:max-h-[85vh] no-scrollbar text-right" dir="rtl">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 md:hidden"></div>
                        <button onClick={() => setShowModal(false)} className="absolute top-6 left-6 md:top-8 md:left-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
                            {modalData.icon} {modalData.title}
                        </h2>

                        <div className="space-y-3">
                            {modalData.list.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl bg-${modalData.color}-500/10 text-${modalData.color}-500`}>
                                            {item.icon === 'certificate' ? <Landmark size={18} /> : 
                                             item.icon === 'debt' ? <Users size={18} /> : 
                                             item.icon === 'card' ? <CreditCard size={18} /> :
                                             item.icon === 'loan' ? <Landmark size={18} /> :
                                             item.icon === 'account' ? <DollarSign size={18} /> :
                                             <Receipt size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{item.name || item.category || item.counterparty || 'عام'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-500 font-bold">
                                                    {item.type ? item.type : item.date ? new Date(item.date).toLocaleDateString('ar-EG') : ''}
                                                </span>
                                                {item.counterparty && <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Tag size={9} /> {item.counterparty}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`text-lg font-black text-${modalData.color}-400`}>
                                        {(item.value || item.amount || 0).toLocaleString()} <span className="text-[9px] opacity-50">ج.م</span>
                                    </p>
                                </div>
                            ))}
                            {modalData.list.length === 0 && (
                                <div className="py-16 text-center text-slate-500 italic">لا توجد بيانات مسجلة</div>
                            )}
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                             <p className="text-slate-500 text-sm font-bold italic">الإجمالي</p>
                             <p className={`text-2xl md:text-3xl font-black text-${modalData.color}-400`}>
                                {(modalData.total || 0).toLocaleString()} <span className="text-sm ml-1">ج.م</span>
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════ */
/* COMPONENTS                                         */
/* ═══════════════════════════════════════════════════ */

const SectionLabel = ({ text, icon }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-500">{icon}</span>
        <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{text}</h2>
    </div>
);

const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', glow: 'shadow-emerald-900/10' },
    red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', glow: 'shadow-red-900/10' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', glow: 'shadow-blue-900/10' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20', glow: 'shadow-orange-900/10' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', glow: 'shadow-rose-900/10' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', glow: 'shadow-purple-900/10' },
};

const HeroCard = ({ label, value, icon, color, sub, signed, onClick }) => {
    const c = colorMap[color] || colorMap.blue;
    const v = value || 0;
    const displayValue = signed && v > 0 ? `+${v.toLocaleString()}` : v.toLocaleString();
    
    return (
        <button onClick={onClick} className={`relative overflow-hidden bg-slate-900 border ${c.border} p-5 md:p-6 rounded-[1.8rem] md:rounded-[2.2rem] shadow-xl ${c.glow} flex flex-col justify-between min-h-[140px] md:min-h-[160px] text-right transition-all hover:scale-[1.02] group`}>
            <div className={`absolute -bottom-4 -left-4 opacity-5 group-hover:scale-110 transition-transform`}>
                <Activity size={120} className={c.text} />
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>{icon}</div>
            </div>
            <div className="relative z-10 mt-auto">
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">{label}</p>
                <p className={`text-xl md:text-2xl font-black ${signed ? (v >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'} truncate`}>
                    {displayValue} <span className="text-[8px] opacity-50 font-bold">ج.م</span>
                </p>
                {sub && <p className="text-[8px] text-slate-600 font-bold mt-1 hidden md:block">{sub}</p>}
            </div>
        </button>
    );
};

const DriverCard = ({ label, value, icon, color, onClick, className = '' }) => {
    const c = colorMap[color] || colorMap.blue;
    const v = value || 0;
    return (
        <button onClick={onClick} className={`bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-lg flex flex-col justify-between hover:${c.border} transition-all group text-right ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>{icon}</div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase">{label}</span>
            </div>
            <p className={`text-lg md:text-xl font-black text-white group-hover:${c.text} transition-colors truncate`}>
                {v.toLocaleString()} <span className="text-[8px] opacity-50 font-bold">ج.م</span>
            </p>
        </button>
    );
};

const IndicatorCard = ({ label, value, icon, status, hint, isAmount }) => {
    const statusColors = {
        good: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400' },
        ok: { bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-500/20 text-amber-400' },
        bad: { bg: 'bg-red-500/10', text: 'text-red-500', badge: 'bg-red-500/20 text-red-400' }
    };
    const s = statusColors[status] || statusColors.ok;
    
    return (
        <div className={`bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-lg`}>
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${s.bg} ${s.text}`}>{icon}</div>
                {hint && <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${s.badge}`}>{hint}</span>}
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-1">{label}</p>
            <p className={`text-lg md:text-xl font-black ${s.text} truncate`}>
                {isAmount ? `${(value || 0).toLocaleString()} ج.م` : value}
            </p>
        </div>
    );
};

export default Dashboard;
