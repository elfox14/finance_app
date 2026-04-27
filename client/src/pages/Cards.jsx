import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, CreditCard, Calendar, 
    ArrowDownCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2, DollarSign,
    Percent, Hash, Info, Sparkles, Clock, Landmark,
    History, PieChart as PieIcon, Wallet, ChevronLeft
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Cards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetails, setCardDetails] = useState({ transactions: [], installments: [], payments: [] });
    const [detailsTab, setDetailsTab] = useState('transactions');

    // Transaction Form State
    const [transForm, setTransForm] = useState({
        amount: '', merchantName: '', transactionDate: new Date().toISOString().split('T')[0],
        category: 'عام', isInstallment: false, instLogic: 'interest', installmentsCount: '12',
        interestRate: '10', installmentAmount: ''
    });

    // Payment Form State
    const [payForm, setPayForm] = useState({
        amount: '', paymentDate: new Date().toISOString().split('T')[0],
        paymentType: 'كامل', sourceAccount: 'كاش', notes: ''
    });

    const [newCardForm, setNewCardForm] = useState({ 
        cardName: '', bankName: '', creditLimit: '', statementDay: '1', dueDay: '1' 
    });

    const fetchCards = async () => {
        try {
            const res = await api.get('/cards');
            setCards(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchCardDetails = async (cardId) => {
        try {
            const res = await api.get(`/cards/details/${cardId}`);
            setCardDetails(res.data);
            setShowDetailsModal(true);
        } catch (err) { alert('خطأ في جلب تفاصيل البطاقة'); }
    };

    useEffect(() => { fetchCards(); }, []);

    const calculateInstallmentPreview = () => {
        const principal = Number(transForm.amount);
        const count = Number(transForm.installmentsCount);
        if (!principal || !count) return null;
        if (transForm.instLogic === 'interest') {
            const rate = Number(transForm.interestRate);
            const interest = principal * (rate / 100);
            const total = principal + interest;
            return { monthly: (total / count).toFixed(2), total: total.toFixed(2), interest: interest.toFixed(2) };
        } else {
            const monthly = Number(transForm.installmentAmount);
            if (!monthly) return null;
            const total = monthly * count;
            const interest = total - principal;
            return { monthly: monthly.toFixed(2), total: total.toFixed(2), interest: interest.toFixed(2) };
        }
    };

    const instPreview = calculateInstallmentPreview();

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                cardId: selectedCard._id, merchantName: transForm.merchantName,
                amount: Number(transForm.amount), transactionDate: transForm.transactionDate,
                category: transForm.category, transactionType: transForm.isInstallment ? 'تقسيط' : 'شراء عادي',
                isInstallment: transForm.isInstallment
            };
            if (transForm.isInstallment) {
                payload.installmentDetails = {
                    installmentsCount: Number(transForm.installmentsCount),
                    interestRate: transForm.instLogic === 'interest' ? Number(transForm.interestRate) : undefined,
                    installmentAmount: transForm.instLogic === 'monthly' ? Number(transForm.installmentAmount) : undefined
                };
            }
            await api.post('/cards/action', payload);
            setShowTransactionModal(false);
            setTransForm({ amount: '', merchantName: '', transactionDate: new Date().toISOString().split('T')[0], category: 'عام', isInstallment: false, instLogic: 'interest', installmentsCount: '12', interestRate: '10', installmentAmount: '' });
            fetchCards();
        } catch (err) { alert('خطأ في تسجيل العملية'); }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards/payment', { ...payForm, cardId: selectedCard._id, amount: Number(payForm.amount) });
            setShowPaymentModal(false);
            setPayForm({ amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentType: 'كامل', sourceAccount: 'كاش', notes: '' });
            fetchCards();
        } catch (err) { alert('خطأ في تسجيل السداد'); }
    };

    const handleCreateCard = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards', newCardForm);
            setShowAddModal(false);
            setNewCardForm({ cardName: '', bankName: '', creditLimit: '', statementDay: '1', dueDay: '1' });
            fetchCards();
        } catch (err) { alert('خطأ في إضافة البطاقة'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/cards/${id}`);
            fetchCards();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const totalUsed = cards.reduce((s, c) => s + (Number(c.analytics?.usedAmount) || 0), 0);
    const totalMonthlyInst = cards.reduce((s, c) => s + (Number(c.analytics?.monthlyInstallmentTotal) || 0), 0);

    const getCardChartData = (card) => {
        const used = Number(card.analytics?.usedAmount) || 0;
        const remaining = Number(card.analytics?.remainingLimit) || 0;
        return {
            labels: ['استهلاك', 'متاح'],
            datasets: [{
                data: [used, remaining],
                backgroundColor: ['#ef4444', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        cutout: '80%'
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* 1) Analytics Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">إدارة البطاقات الائتمانية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">مراقبة حدود الائتمان والأقساط النشطة</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-6 py-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-xs font-bold text-slate-400">
                        <Info size={16} className="text-blue-500" /> <span className="text-white text-lg ml-1">{cards.length}</span> بطاقات نشطة
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/40">
                        <Plus size={20} /> تعريف بطاقة جديدة
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Global Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <CreditCard size={120} className="text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-8 relative z-10">
                            <CreditCard className="text-blue-500" /> إجمالي المديونيات الحالية
                        </h3>
                        <p className="text-5xl font-black text-white relative z-10">{totalUsed.toLocaleString()} <span className="text-xl opacity-50">ج.م</span></p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 border border-blue-500/30 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Calendar size={120} className="text-white" />
                        </div>
                        <h3 className="text-xl font-black text-blue-200 flex items-center gap-2 mb-8 relative z-10">
                            <Calendar className="text-blue-400" /> إجمالي أقساط هذا الشهر للبطاقات
                        </h3>
                        <p className="text-5xl font-black text-white relative z-10">{totalMonthlyInst.toLocaleString()} <span className="text-xl opacity-50">ج.م</span></p>
                    </div>
                </div>

                {/* 2) Cards List */}
                <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {cards.map((card) => {
                        const analytics = card.analytics || {};
                        const usagePercent = Number(analytics.usagePercent) || 0;
                        return (
                            <div key={card._id} className="group relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl hover:border-blue-500/30 transition-all overflow-hidden flex flex-col gap-8">
                                <div className="absolute top-8 left-8">
                                    <button onClick={() => handleDelete(card._id)} className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-center z-10">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-white tracking-tight">{card.cardName}</h3>
                                            <span className={`text-[10px] px-3 py-1 rounded-xl bg-${analytics.riskColor}-500/20 text-${analytics.riskColor}-400 font-black border border-${analytics.riskColor}-500/30`}>{analytics.riskStatus}</span>
                                        </div>
                                        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">{card.bankName} • **** {card.lastFourDigits || '0000'}</p>
                                    </div>
                                    <div className="w-16 h-16 relative flex items-center justify-center">
                                        <Doughnut data={getCardChartData(card)} options={doughnutOptions} />
                                    </div>
                                </div>

                                <div className="space-y-4 z-10">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الاستهلاك الحالي</p>
                                            <p className="text-4xl font-black text-white">{(Number(analytics.usedAmount) || 0).toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">المتاح</p>
                                            <p className="text-xl font-black text-blue-400">{analytics.remainingLimit?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${usagePercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                        <span>الحد الائتماني: {card.creditLimit?.toLocaleString()}</span>
                                        <span>النسبة: {usagePercent}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
                                    <button onClick={() => { setSelectedCard(card); setShowTransactionModal(true); }} className="flex flex-col items-center justify-center gap-3 py-5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all border border-slate-700 hover:border-blue-500/50">
                                        <ArrowDownCircle size={24} className="text-orange-500" /> <span className="text-xs">سحب / شراء</span>
                                    </button>
                                    <button onClick={() => { setSelectedCard(card); setDetailsTab('transactions'); fetchCardDetails(card._id); }} className="flex flex-col items-center justify-center gap-3 py-5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all border border-slate-700 hover:border-blue-500/50">
                                        <History size={24} className="text-blue-400" /> <span className="text-xs">عمليات</span>
                                    </button>
                                    <button onClick={() => { setSelectedCard(card); setDetailsTab('installments'); fetchCardDetails(card._id); }} className="flex flex-col items-center justify-center gap-3 py-5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all border border-slate-700 hover:border-blue-500/50">
                                        <Landmark size={24} className="text-emerald-400" /> <span className="text-xs">أقساط</span>
                                    </button>
                                    <button onClick={() => { setSelectedCard(card); setShowPaymentModal(true); }} className="flex flex-col items-center justify-center gap-3 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-bold transition-all shadow-lg shadow-blue-900/30">
                                        <DollarSign size={24} /> <span className="text-xs">سداد مديونية</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {cards.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-slate-900 border-2 border-slate-800 border-dashed rounded-[3rem]">
                            <CreditCard size={64} className="mx-auto mb-6 text-slate-700" />
                            <p className="font-bold text-white text-xl">لا توجد بطاقات ائتمانية مسجلة</p>
                            <p className="text-slate-500 text-sm mt-2">أضف بطاقاتك لإدارة حدود الائتمان والأقساط</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3) Detailed View Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-5xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar text-right">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <div className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 italic flex items-center gap-3">
                                <CreditCard className="text-blue-500" /> تفاصيل البطاقة: {selectedCard?.cardName}
                            </h2>
                            <div className="flex gap-4 mt-8 border-b border-slate-800">
                                {['transactions', 'installments', 'payments'].map(tab => (
                                    <button key={tab} onClick={() => setDetailsTab(tab)} className={`pb-4 px-6 text-lg font-black transition-all border-b-4 ${detailsTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                                        {tab === 'transactions' ? 'العمليات' : tab === 'installments' ? 'الأقساط النشطة' : 'سجل السداد'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            {detailsTab === 'transactions' && (
                                cardDetails.transactions.length > 0 ? cardDetails.transactions.map(t => (
                                    <div key={t._id} className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] border border-slate-800 group hover:border-slate-700 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-slate-800 rounded-2xl"><Receipt size={24} className="text-slate-400" /></div>
                                            <div>
                                                <p className="font-black text-white text-lg mb-1">{t.merchantName}</p>
                                                <p className="text-xs text-slate-500">{new Date(t.transactionDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-black text-white">{t.amount?.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                    </div>
                                )) : <div className="py-20 text-center text-slate-500">لا توجد عمليات مسجلة</div>
                            )}
                            {detailsTab === 'installments' && (
                                cardDetails.installments.length > 0 ? cardDetails.installments.map(i => (
                                    <div key={i._id} className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xl font-black text-white">قسط شهري: {i.installmentAmount?.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                            <span className="text-xs font-black px-4 py-1.5 bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 rounded-xl">{i.status}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6 text-center border-t border-slate-800 pt-6">
                                            <div className="p-4 bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">الأصل</p>
                                                <p className="text-xl font-black text-white">{i.principalAmount}</p>
                                            </div>
                                            <div className="p-4 bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">الفائدة</p>
                                                <p className="text-xl font-black text-orange-500">{i.totalAfterInterest - i.principalAmount}</p>
                                            </div>
                                            <div className="p-4 bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">الشهور</p>
                                                <p className="text-xl font-black text-blue-500">{i.installmentsCount}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="py-20 text-center text-slate-500">لا توجد أقساط نشطة</div>
                            )}
                            {detailsTab === 'payments' && (
                                cardDetails.payments.length > 0 ? cardDetails.payments.map(p => (
                                    <div key={p._id} className="flex items-center justify-between p-6 bg-emerald-900/10 rounded-[2rem] border border-emerald-500/20">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Plus size={24} /></div>
                                            <div>
                                                <p className="font-black text-white text-lg mb-1">تم سداد دفعة للمديونية</p>
                                                <p className="text-xs text-slate-500">{new Date(p.paymentDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-black text-emerald-400">{p.amount?.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                    </div>
                                )) : <div className="py-20 text-center text-slate-500">لا يوجد سجل سداد</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 4) Payment Modal (Sadaad) */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3"><DollarSign className="text-blue-500" /> سداد مديونية للبطاقة</h2>
                        <form onSubmit={handleAddPayment} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">المبلغ المراد سداده (ج.م)</label>
                                <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] text-3xl font-black text-center focus:border-blue-500 outline-none transition-all" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">تاريخ السداد</label>
                                <input type="date" required className="w-full bg-slate-900 border border-slate-800 text-slate-300 p-5 rounded-[2rem] font-bold text-center focus:border-blue-500 outline-none transition-all" value={payForm.paymentDate} onChange={e => setPayForm({...payForm, paymentDate: e.target.value})} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">الحساب المحول منه</label>
                                <select className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500" value={payForm.sourceAccount} onChange={e => setPayForm({...payForm, sourceAccount: e.target.value})}>
                                    <option value="كاش">كاش / نقدي</option><option value="بنك">حساب بنكي</option><option value="محفظة">محفظة إلكترونية</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/30 transition-all mt-4">تأكيد السداد وتحديث الرصيد المتاح</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 5) Add Transaction Modal */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar text-right">
                        <button onClick={() => setShowTransactionModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white mb-2 italic">تسجيل حركة بطاقة</h2>
                            <p className="text-slate-500 text-sm">البطاقة المحددة: <span className="text-blue-400 font-bold">{selectedCard?.cardName}</span></p>
                        </div>
                        <form onSubmit={handleAddTransaction} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">قيمة العملية (ج.م)</label>
                                    <input type="number" required placeholder="0.00" className="w-full bg-slate-900 border border-slate-800 text-white px-6 py-5 rounded-[2rem] text-2xl font-black focus:border-blue-500 outline-none transition-all" value={transForm.amount} onChange={e => setTransForm({...transForm, amount: e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">التاجر / الجهة</label>
                                    <input type="text" required placeholder="أمازون، كارفور..." className="w-full bg-slate-900 border border-slate-800 text-white px-6 py-5 rounded-[2rem] text-xl font-bold focus:border-blue-500 outline-none transition-all" value={transForm.merchantName} onChange={e => setTransForm({...transForm, merchantName: e.target.value})} />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-between cursor-pointer" onClick={() => setTransForm({...transForm, isInstallment: !transForm.isInstallment})}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${transForm.isInstallment ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Clock size={24} /></div>
                                    <div>
                                        <p className="font-black text-white text-lg">هل العملية خاضعة للتقسيط؟</p>
                                        <p className="text-xs text-slate-500 mt-1">تفعيل هذه الميزة سيحول المبلغ لجدول أقساط</p>
                                    </div>
                                </div>
                                <div className={`w-16 h-8 rounded-full relative transition-all ${transForm.isInstallment ? 'bg-orange-500' : 'bg-slate-800'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${transForm.isInstallment ? 'left-1' : 'left-9'}`}></div></div>
                            </div>
                            
                            {transForm.isInstallment && (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50">
                                    <div className="flex gap-2 p-2 bg-slate-900 border border-slate-800 rounded-[1.5rem]">
                                        <button type="button" onClick={() => setTransForm({...transForm, instLogic: 'interest'})} className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${transForm.instLogic === 'interest' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500'}`}>حساب بنسبة الفائدة</button>
                                        <button type="button" onClick={() => setTransForm({...transForm, instLogic: 'monthly'})} className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${transForm.instLogic === 'monthly' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500'}`}>إدخال مبلغ القسط الثابت</button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase">عدد الشهور</label>
                                            <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl text-center font-black text-xl focus:border-blue-500 outline-none" value={transForm.installmentsCount} onChange={e => setTransForm({...transForm, installmentsCount: e.target.value})} />
                                        </div>
                                        {transForm.instLogic === 'interest' ? (
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-slate-500 font-bold uppercase">فائدة التقسيط %</label>
                                                <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl text-center font-black text-xl focus:border-blue-500 outline-none" value={transForm.interestRate} onChange={e => setTransForm({...transForm, interestRate: e.target.value})} />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-slate-500 font-bold uppercase">مبلغ القسط (ج.م)</label>
                                                <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl text-center font-black text-xl focus:border-blue-500 outline-none" value={transForm.installmentAmount} onChange={e => setTransForm({...transForm, installmentAmount: e.target.value})} />
                                            </div>
                                        )}
                                        {instPreview && (
                                            <div className="flex flex-col justify-center text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-2xl mt-6 md:mt-0">
                                                <p className="text-[10px] text-blue-400 font-black uppercase mb-1">القسط المتوقع</p>
                                                <p className="text-xl font-black text-white">{instPreview.monthly}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-900/30 transition-all mt-6">تأكيد وتسجيل العملية</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 6) Add Card Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border-2 border-blue-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3"><CreditCard className="text-blue-500" /> تعريف بطاقة ائتمانية جديدة</h2>
                        <form onSubmit={handleCreateCard} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">الاسم أو اللقب التعريفي</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newCardForm.cardName} onChange={e => setNewCardForm({...newCardForm, cardName: e.target.value})} placeholder="مثال: فيزا المشتريات" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">البنك المصدر</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newCardForm.bankName} onChange={e => setNewCardForm({...newCardForm, bankName: e.target.value})} placeholder="البنك الأهلي، بنك مصر..." />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">الحد الائتماني للبطاقة (ج.م)</label>
                                <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl focus:border-blue-500 outline-none" value={newCardForm.creditLimit} onChange={e => setNewCardForm({...newCardForm, creditLimit: e.target.value})} placeholder="مثال: 50000" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">يوم إصدار كشف الحساب شهرياً</label>
                                    <input type="number" min="1" max="31" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-center focus:border-blue-500 outline-none" value={newCardForm.statementDay} onChange={e => setNewCardForm({...newCardForm, statementDay: e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">يوم السداد / الاستحقاق</label>
                                    <input type="number" min="1" max="31" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-center focus:border-blue-500 outline-none" value={newCardForm.dueDay} onChange={e => setNewCardForm({...newCardForm, dueDay: e.target.value})} />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="py-5 px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black transition-all">إلغاء</button>
                                <button type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/30 transition-all">حفظ واعتماد البطاقة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
