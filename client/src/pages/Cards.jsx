import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, CreditCard, Calendar, 
    ArrowUpCircle, ArrowDownCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2, DollarSign,
    Percent, Hash, Info, Sparkles, Clock, Landmark,
    History, PieChart, Wallet, ChevronLeft
} from 'lucide-react';

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
            fetchCards();
        } catch (err) { alert('خطأ في تسجيل العملية'); }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards/payment', { ...payForm, cardId: selectedCard._id, amount: Number(payForm.amount) });
            setShowPaymentModal(false);
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

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const totalUsed = cards.reduce((s, c) => s + (Number(c.analytics?.usedAmount) || 0), 0);
    const totalMonthlyInst = cards.reduce((s, c) => s + (Number(c.analytics?.monthlyInstallmentTotal) || 0), 0);

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20 px-4 md:px-0" dir="rtl">
            {/* 1) Analytics Header */}
            <header className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">دورة البطاقات الائتمانية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">إدارة الشراء، التقسيط، والسداد باحترافية</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl group hover:border-blue-500/30 transition-all">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">إجمالي المستخدم</p>
                    <p className="text-xl font-black text-white">{totalUsed.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                </div>
                <div className="bg-blue-600 border border-blue-500 p-5 rounded-3xl shadow-lg shadow-blue-900/20">
                    <p className="text-[10px] text-blue-100 font-bold uppercase mb-1">أقساط هذا الشهر</p>
                    <p className="text-xl font-black text-white">{totalMonthlyInst.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                </div>
            </header>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400">
                    <Info size={14} className="text-blue-500" /> متاح لديك {cards.length} بطاقة نشطة
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm">
                    <Plus size={18} /> تعريف بطاقة جديدة
                </button>
            </div>

            {/* 2) Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cards.map((card) => {
                    const analytics = card.analytics || {};
                    const usagePercent = Number(analytics.usagePercent) || 0;
                    return (
                        <div key={card._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl hover:border-blue-500/30 transition-all">
                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl md:text-2xl font-black text-white">{card.cardName}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-lg bg-${analytics.riskColor}-500/10 text-${analytics.riskColor}-500 font-black`}>{analytics.riskStatus}</span>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{card.bankName} • **** {card.lastFourDigits || '0000'}</p>
                                    </div>
                                    <div className="p-4 bg-blue-600/10 text-blue-500 rounded-3xl"><CreditCard size={32} /></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-3xl font-black text-white">{(Number(analytics.usedAmount) || 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                                        <p className="text-[10px] text-slate-500 font-bold">المتاح: {analytics.remainingLimit?.toLocaleString()}</p>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${usagePercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 italic">
                                        <span>حد: {card.creditLimit?.toLocaleString()}</span>
                                        <span>استهلاك: {usagePercent}%</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <button onClick={() => { setSelectedCard(card); setShowTransactionModal(true); }} className="flex flex-col items-center gap-2 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all border border-slate-800">
                                        <ArrowDownCircle size={20} className="text-orange-500" /> <span className="text-[10px]">شراء</span>
                                    </button>
                                    <button onClick={() => { setSelectedCard(card); setDetailsTab('transactions'); fetchCardDetails(card._id); }} className="flex flex-col items-center gap-2 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all border border-slate-800">
                                        <History size={20} className="text-blue-400" /> <span className="text-[10px]">عمليات</span>
                                    </button>
                                    <button onClick={() => { setSelectedCard(card); setDetailsTab('installments'); fetchCardDetails(card._id); }} className="flex flex-col items-center gap-2 py-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-bold transition-all border border-slate-800">
                                        <Landmark size={20} className="text-emerald-400" /> <span className="text-[10px]">أقساط</span>
                                    </button>
                                    <button onClick={() => { setSelectedCard(card); setShowPaymentModal(true); }} className="flex flex-col items-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold transition-all">
                                        <DollarSign size={20} /> <span className="text-[10px]">سداد</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3) Detailed View Modal (History/Installments/Payments) */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white mb-2">تفاصيل البطاقة: {selectedCard?.cardName}</h2>
                            <div className="flex gap-4 mt-6 border-b border-slate-800">
                                {['transactions', 'installments', 'payments'].map(tab => (
                                    <button key={tab} onClick={() => setDetailsTab(tab)} className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${detailsTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500'}`}>
                                        {tab === 'transactions' ? 'العمليات' : tab === 'installments' ? 'الأقساط النشطة' : 'سجل السداد'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {detailsTab === 'transactions' && cardDetails.transactions.map(t => (
                                <div key={t._id} className="flex items-center justify-between p-5 bg-slate-900 rounded-3xl border border-slate-800 group hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-800 rounded-2xl"><Receipt size={20} className="text-slate-400" /></div>
                                        <div><p className="font-black text-white">{t.merchantName}</p><p className="text-[10px] text-slate-500">{new Date(t.transactionDate).toLocaleDateString('ar-EG')}</p></div>
                                    </div>
                                    <p className="text-lg font-black text-white">{t.amount?.toLocaleString()} ج.م</p>
                                </div>
                            ))}
                            {detailsTab === 'installments' && cardDetails.installments.map(i => (
                                <div key={i._id} className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                                    <div className="flex justify-between">
                                        <p className="font-black text-white">قسط شهري: {i.installmentAmount?.toLocaleString()} ج.م</p>
                                        <span className="text-[10px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">{i.status}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 bg-slate-800/50 rounded-2xl"><p className="text-[8px] text-slate-500 font-bold uppercase">الأصل</p><p className="text-sm font-black text-white">{i.principalAmount}</p></div>
                                        <div className="p-3 bg-slate-800/50 rounded-2xl"><p className="text-[8px] text-slate-500 font-bold uppercase">الفائدة</p><p className="text-sm font-black text-orange-500">{i.totalAfterInterest - i.principalAmount}</p></div>
                                        <div className="p-3 bg-slate-800/50 rounded-2xl"><p className="text-[8px] text-slate-500 font-bold uppercase">الشهور</p><p className="text-sm font-black text-blue-500">{i.installmentsCount}</p></div>
                                    </div>
                                </div>
                            ))}
                            {detailsTab === 'payments' && cardDetails.payments.map(p => (
                                <div key={p._id} className="flex items-center justify-between p-5 bg-emerald-900/10 rounded-3xl border border-emerald-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><CheckCircle2 size={20} /></div>
                                        <div><p className="font-black text-white">تم سداد دفعة</p><p className="text-[10px] text-slate-500">{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</p></div>
                                    </div>
                                    <p className="text-lg font-black text-emerald-500">{p.amount?.toLocaleString()} ج.م</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 4) Payment Modal (Sadaad) */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-sm rounded-[3rem] p-10 relative shadow-2xl">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic"><DollarSign className="text-blue-500" /> سداد مديونية</h2>
                        <form onSubmit={handleAddPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">المبلغ المراد سداده</label>
                                <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] text-2xl font-black text-center focus:border-blue-500 outline-none transition-all" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">الحساب المحول منه</label>
                                <select className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none" value={payForm.sourceAccount} onChange={e => setPayForm({...payForm, sourceAccount: e.target.value})}>
                                    <option value="كاش">كاش / نقدي</option><option value="بنك">حساب بنكي</option><option value="محفظة">محفظة إلكترونية</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/20 transition-all">تأكيد السداد وتحديث الرصيد</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Existing Modal Transactions and Add Card (Keeping standard from previous) */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowTransactionModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <div className="mb-10"><h2 className="text-2xl font-black text-white mb-2">تسجيل حركة بطاقة ذكية</h2><p className="text-slate-500 text-sm">البطاقة: {selectedCard?.cardName}</p></div>
                        <form onSubmit={handleAddTransaction} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="number" required placeholder="المبلغ" className="w-full bg-slate-900 border border-slate-800 text-white px-6 py-5 rounded-[2rem] text-2xl font-black focus:border-blue-500 outline-none transition-all" value={transForm.amount} onChange={e => setTransForm({...transForm, amount: e.target.value})} />
                                <input type="text" required placeholder="التاجر" className="w-full bg-slate-900 border border-slate-800 text-white px-6 py-5 rounded-[2rem] font-bold focus:border-blue-500 outline-none transition-all" value={transForm.merchantName} onChange={e => setTransForm({...transForm, merchantName: e.target.value})} />
                            </div>
                            <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-between">
                                <div className="flex items-center gap-4"><div className={`p-3 rounded-2xl ${transForm.isInstallment ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}><Clock size={20} /></div><div><p className="font-black text-white text-sm">هل العملية تقسيط؟</p></div></div>
                                <button type="button" onClick={() => setTransForm({...transForm, isInstallment: !transForm.isInstallment})} className={`w-14 h-8 rounded-full relative transition-all ${transForm.isInstallment ? 'bg-orange-500' : 'bg-slate-800'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${transForm.isInstallment ? 'left-1' : 'left-7'}`}></div></button>
                            </div>
                            {transForm.isInstallment && (
                                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                    <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
                                        <button type="button" onClick={() => setTransForm({...transForm, instLogic: 'interest'})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${transForm.instLogic === 'interest' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>بنسبة الفائدة</button>
                                        <button type="button" onClick={() => setTransForm({...transForm, instLogic: 'monthly'})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${transForm.instLogic === 'monthly' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>بمبلغ القسط</button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <input type="number" placeholder="شهور" className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl text-center font-black" value={transForm.installmentsCount} onChange={e => setTransForm({...transForm, installmentsCount: e.target.value})} />
                                        {transForm.instLogic === 'interest' ? <input type="number" placeholder="فائدة %" className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl text-center font-black" value={transForm.interestRate} onChange={e => setTransForm({...transForm, interestRate: e.target.value})} /> : <input type="number" placeholder="القسط" className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl text-center font-black" value={transForm.installmentAmount} onChange={e => setTransForm({...transForm, installmentAmount: e.target.value})} />}
                                        {instPreview && <div className="flex flex-col justify-center text-center p-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl"><p className="text-[8px] text-blue-500 font-black uppercase">قسطك</p><p className="text-lg font-black text-white">{instPreview.monthly}</p></div>}
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xl shadow-2xl transition-all">تأكيد العملية</button>
                        </form>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic"><Landmark className="text-blue-500" /> تعريف بطاقة جديدة</h2>
                        <form onSubmit={handleCreateCard} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newCardForm.cardName} onChange={e => setNewCardForm({...newCardForm, cardName: e.target.value})} placeholder="اسم البطاقة" />
                                <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newCardForm.bankName} onChange={e => setNewCardForm({...newCardForm, bankName: e.target.value})} placeholder="البنك" />
                            </div>
                            <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl focus:border-blue-500" value={newCardForm.creditLimit} onChange={e => setNewCardForm({...newCardForm, creditLimit: e.target.value})} placeholder="الحد الائتماني" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="يوم الكشف" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-center" value={newCardForm.statementDay} onChange={e => setNewCardForm({...newCardForm, statementDay: e.target.value})} />
                                <input type="number" placeholder="يوم السداد" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-center" value={newCardForm.dueDay} onChange={e => setNewCardForm({...newCardForm, dueDay: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg transition-all mt-4">حفظ البطاقة</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
