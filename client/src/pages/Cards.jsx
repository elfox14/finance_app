import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, CreditCard, Calendar, 
    ArrowDownCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2, DollarSign,
    Percent, Hash, Info, Sparkles, Clock, Landmark,
    History, PieChart as PieIcon, Wallet, ChevronLeft, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Cards = () => {
    const [cards, setCards] = useState([]);
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetails, setCardDetails] = useState({ transactions: [], installments: [], payments: [] });
    const [detailsTab, setDetailsTab] = useState('transactions');

    const [transForm, setTransForm] = useState({
        amount: '', merchantName: '', transactionDate: new Date().toISOString().split('T')[0],
        category: 'عام', isInstallment: false, instLogic: 'interest', installmentsCount: '12',
        interestRate: '0', installmentAmount: ''
    });

    const [payForm, setPayForm] = useState({
        amount: '', paymentDate: new Date().toISOString().split('T')[0],
        paymentType: 'سداد جزئي', sourceAccount: '', notes: ''
    });

    const [newCardForm, setNewCardForm] = useState({ 
        cardName: '', bankName: '', cardType: 'credit', linkedAccountId: '', creditLimit: '', statementDay: '1', dueDay: '1' 
    });

    const fetchData = async () => {
        try {
            const [resCards, resAccs] = await Promise.all([
                api.get('/cards'),
                api.get('/accounts')
            ]);
            setCards(resCards.data.cards || []);
            setStats(resCards.data.stats || null);
            setRecentTransactions(resCards.data.recentTransactions || []);
            setAccounts(resAccs.data || []);
            if (resAccs.data?.length > 0) {
                setNewCardForm(f => ({ ...f, linkedAccountId: resAccs.data[0]._id }));
                setPayForm(f => ({ ...f, sourceAccount: resAccs.data[0]._id }));
            }
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

    useEffect(() => { fetchData(); }, []);

    const handleCreateCard = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards', newCardForm);
            setShowAddModal(false);
            setNewCardForm({ cardName: '', bankName: '', cardType: 'credit', linkedAccountId: accounts[0]?._id, creditLimit: '', statementDay: '1', dueDay: '1' });
            fetchData();
        } catch (err) { alert('خطأ في إضافة البطاقة'); }
    };

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
            setTransForm({ amount: '', merchantName: '', transactionDate: new Date().toISOString().split('T')[0], category: 'عام', isInstallment: false, instLogic: 'interest', installmentsCount: '12', interestRate: '0', installmentAmount: '' });
            fetchData();
        } catch (err) { alert('خطأ في تسجيل العملية'); }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards/payment', { ...payForm, cardId: selectedCard._id, amount: Number(payForm.amount) });
            setShowPaymentModal(false);
            fetchData();
        } catch (err) { alert('خطأ في تسجيل السداد'); }
    };

    const handleReconcile = async (txId, status) => {
        try {
            await api.put(`/cards/transaction/${txId}/reconcile`, { status });
            // تحديث محلي سريع بدون لودنج كامل
            setCardDetails(prev => ({
                ...prev,
                transactions: prev.transactions.map(t => t._id === txId ? { ...t, reconciliationStatus: status } : t)
            }));
            fetchData(); // لتحديث إحصائيات الداشبورد
        } catch (err) { alert('خطأ في التسوية'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/cards/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const getCardChartData = (card) => {
        if (card.cardType === 'debit' || card.cardType === 'خصم مباشر') {
            return { labels: ['رصيد الحساب'], datasets: [{ data: [100], backgroundColor: ['#10b981'], borderWidth: 0 }] };
        }
        const used = Number(card.analytics?.usedAmount) || 0;
        const remaining = Number(card.analytics?.remainingLimit) || 0;
        return {
            labels: ['مستخدم', 'متاح'],
            datasets: [{ data: [used, remaining], backgroundColor: ['#ef4444', '#3b82f6'], borderWidth: 0 }]
        };
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">البطاقات والحسابات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">إدارة البطاقات الائتمانية والخصم المباشر، ومطابقة الكشوفات</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/40">
                    <Plus size={20} /> تعريف بطاقة جديدة
                </button>
            </header>

            {/* 1) KPI Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                <ControlStat label="إجمالي مديونية البطاقات" val={stats?.totalUsedCredit} color="text-red-400" bg="bg-slate-900" />
                <ControlStat label="إجمالي الائتمان المتاح" val={stats?.totalAvailableCredit} color="text-blue-400" bg="bg-slate-900" />
                <ControlStat label="إجمالي الحدود الائتمانية" val={stats?.totalCreditLimit} color="text-slate-300" bg="bg-slate-900" />
                <ControlStat 
                    label="عمليات غير مسواة (Reconciliation)" 
                    val={stats?.totalUnreconciled} 
                    isText 
                    color={stats?.totalUnreconciled > 0 ? "text-orange-500" : "text-emerald-500"} 
                    bg="bg-slate-900" 
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 md:px-0">
                {/* 2) Cards List */}
                <div className="xl:col-span-2 space-y-6">
                    {cards.map((card) => {
                        const isCredit = card.cardType === 'credit' || card.cardType === 'ائتمانية';
                        const analytics = card.analytics || {};
                        return (
                            <div key={card._id} className={`group relative border rounded-[3rem] p-8 md:p-10 shadow-2xl transition-all overflow-hidden flex flex-col md:flex-row gap-8 ${isCredit ? 'bg-slate-900 border-slate-800 hover:border-blue-500/30' : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'}`}>
                                <div className="absolute top-8 left-8">
                                    <button onClick={() => handleDelete(card._id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4 w-full md:w-1/3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${isCredit ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">{card.cardName}</h3>
                                            <p className="text-xs font-bold text-slate-500 mt-1">{card.bankName} • {card.lastFourDigits}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <span className={`text-[10px] px-3 py-1 rounded-xl font-black ${isCredit ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'}`}>
                                            {isCredit ? 'بطاقة ائتمان (Credit)' : 'خصم مباشر (Debit)'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    {isCredit ? (
                                        <>
                                            <div className="flex justify-between items-end mb-3">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الرصيد المستخدم</p>
                                                    <p className="text-3xl font-black text-red-400">{(Number(analytics.usedAmount) || 0).toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">المتاح</p>
                                                    <p className="text-xl font-black text-blue-400">{analytics.remainingLimit?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                                <div className={`h-full transition-all duration-1000 ${analytics.riskColor === 'red' ? 'bg-red-500' : analytics.riskColor === 'orange' ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${analytics.usagePercent}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                                <span>الحد: {card.creditLimit?.toLocaleString()}</span>
                                                <span className={`text-${analytics.riskColor}-400`}>{analytics.usagePercent}%</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الحساب المرتبط</p>
                                                <p className="text-lg font-black text-emerald-400">{card.linkedAccountId?.name || 'حساب بنكي'}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">السحب المباشر</p>
                                                <p className="text-xs font-bold text-slate-400 mt-1">تؤثر فوراً على الحساب</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full md:w-32 flex-shrink-0">
                                    <button onClick={() => { setSelectedCard(card); setShowTransactionModal(true); }} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black transition-all">
                                        تسجيل حركة
                                    </button>
                                    {isCredit && (
                                        <button onClick={() => { setSelectedCard(card); setShowPaymentModal(true); }} className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-2xl text-xs font-black transition-all">
                                            سداد
                                        </button>
                                    )}
                                    <button onClick={() => { setSelectedCard(card); setDetailsTab(isCredit ? 'reconciliation' : 'transactions'); fetchCardDetails(card._id); }} className="w-full py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-2xl text-xs font-black transition-all">
                                        التفاصيل
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {cards.length === 0 && (
                        <div className="py-24 text-center bg-slate-900 border-2 border-slate-800 border-dashed rounded-[3rem]">
                            <CreditCard size={64} className="mx-auto mb-6 text-slate-700" />
                            <p className="font-bold text-white text-xl">لا توجد بطاقات مسجلة</p>
                        </div>
                    )}
                </div>

                {/* 3) Global Recent Transactions & Reconciliation Info */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
                        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                            <History className="text-slate-400" /> أحدث عمليات البطاقات
                        </h3>
                        <div className="space-y-4">
                            {recentTransactions.map(tx => (
                                <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                    <div>
                                        <p className="font-black text-white text-sm">{tx.merchantName}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{tx.cardId?.cardName}</span>
                                            {tx.reconciliationStatus === 'pending' && <span className="text-[10px] text-orange-400 bg-orange-900/20 px-2 py-0.5 rounded">غير مسوّى</span>}
                                        </div>
                                    </div>
                                    <p className="font-black text-white">{tx.amount.toLocaleString()}</p>
                                </div>
                            ))}
                            {recentTransactions.length === 0 && <p className="text-center text-slate-500 text-sm">لا توجد عمليات</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details & Reconciliation Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-5xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar text-right">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-white italic flex items-center gap-3">
                                <CreditCard className="text-blue-500" /> {selectedCard?.cardName}
                            </h2>
                            <div className="flex flex-wrap gap-4 mt-8 border-b border-slate-800">
                                {['reconciliation', 'transactions', 'installments', 'payments'].map(tab => {
                                    if (!selectedCard?.cardType?.includes('credit') && (tab === 'installments' || tab === 'payments')) return null;
                                    const labels = { reconciliation: 'مطابقة وتسوية', transactions: 'سجل العمليات', installments: 'الأقساط النشطة', payments: 'سجل السداد' };
                                    return (
                                        <button key={tab} onClick={() => setDetailsTab(tab)} className={`pb-4 px-6 text-base font-black transition-all border-b-4 ${detailsTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                                            {labels[tab]}
                                            {tab === 'reconciliation' && (cardDetails.transactions || []).filter(t => t.reconciliationStatus === 'pending').length > 0 && (
                                                <span className="ml-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full">{(cardDetails.transactions || []).filter(t => t.reconciliationStatus === 'pending').length}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {detailsTab === 'reconciliation' && (
                                <div className="space-y-4">
                                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl mb-6">
                                        <p className="text-sm font-bold text-blue-200 flex items-center gap-2"><ShieldAlert size={16}/> التسوية (Reconciliation): قارن هذه العمليات مع كشف حساب البنك أو التطبيق البنكي، واضغط "مطابقة" للتأكيد.</p>
                                    </div>
                                    {(cardDetails.transactions || []).filter(t => t.reconciliationStatus === 'pending').map(t => (
                                        <div key={t._id} className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl border border-orange-500/30 hover:border-orange-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-slate-800 rounded-xl"><Receipt size={20} className="text-orange-400" /></div>
                                                <div>
                                                    <p className="font-black text-white">{t.merchantName}</p>
                                                    <p className="text-xs text-slate-400">{new Date(t.transactionDate).toLocaleDateString('ar-EG')} • {t.amount} ج.م</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleReconcile(t._id, 'matched')} className="px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-black transition-all">
                                                    مطابقة ✔
                                                </button>
                                                <button onClick={() => handleReconcile(t._id, 'disputed')} className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black transition-all">
                                                    اعتراض ✘
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(cardDetails.transactions || []).filter(t => t.reconciliationStatus === 'pending').length === 0 && (
                                        <div className="py-12 text-center text-emerald-500"><CheckCircle2 size={48} className="mx-auto mb-4 opacity-50"/> <p className="font-black">كل العمليات مطابقة ومسوّاة!</p></div>
                                    )}
                                </div>
                            )}

                            {detailsTab === 'transactions' && (
                                (cardDetails.transactions || []).map(t => (
                                    <div key={t._id} className="flex items-center justify-between p-5 bg-slate-900 rounded-2xl border border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${t.reconciliationStatus === 'matched' ? 'bg-emerald-500' : t.reconciliationStatus === 'disputed' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                            <div>
                                                <p className="font-black text-white">{t.merchantName}</p>
                                                <p className="text-xs text-slate-500">{new Date(t.transactionDate).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </div>
                                        <p className="text-xl font-black text-white">{t.amount?.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                    </div>
                                ))
                            )}
                            
                            {detailsTab === 'installments' && (
                                (cardDetails.installments || []).length > 0 ? (cardDetails.installments || []).map(i => (
                                    <div key={i._id} className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xl font-black text-white">قسط شهري: {i.installmentAmount?.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                            <span className="text-xs font-black px-4 py-1.5 bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 rounded-xl">{i.status}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center border-t border-slate-800 pt-6">
                                            <div className="p-4 bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 md:mb-2">الأصل</p>
                                                <p className="text-lg md:text-xl font-black text-white">{i.principalAmount}</p>
                                            </div>
                                            <div className="p-4 bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 md:mb-2">الفائدة</p>
                                                <p className="text-lg md:text-xl font-black text-orange-500">{i.totalAfterInterest - i.principalAmount}</p>
                                            </div>
                                            <div className="p-4 bg-slate-800/50 rounded-2xl">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 md:mb-2">الشهور</p>
                                                <p className="text-lg md:text-xl font-black text-blue-500">{i.installmentsCount}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="py-20 text-center text-slate-500">لا توجد أقساط نشطة</div>
                            )}

                            {detailsTab === 'payments' && (
                                (cardDetails.payments || []).length > 0 ? (cardDetails.payments || []).map(p => (
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

            {/* Add Card Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border-2 border-blue-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3"><CreditCard className="text-blue-500" /> تعريف بطاقة جديدة</h2>
                        <form onSubmit={handleCreateCard} className="space-y-6">
                            <div className="flex gap-4 p-2 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
                                <button type="button" onClick={() => setNewCardForm({...newCardForm, cardType: 'credit'})} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${newCardForm.cardType === 'credit' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>بطاقة ائتمان (Credit)</button>
                                <button type="button" onClick={() => setNewCardForm({...newCardForm, cardType: 'debit'})} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${newCardForm.cardType === 'debit' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>خصم مباشر (Debit)</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">اسم البطاقة</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl focus:border-blue-500 outline-none font-bold" value={newCardForm.cardName} onChange={e => setNewCardForm({...newCardForm, cardName: e.target.value})} placeholder="مثال: فيزا المشتريات" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">البنك</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl focus:border-blue-500 outline-none font-bold" value={newCardForm.bankName} onChange={e => setNewCardForm({...newCardForm, bankName: e.target.value})} />
                                </div>
                            </div>

                            {newCardForm.cardType === 'credit' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">الحد الائتماني (ج.م)</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl font-black text-xl focus:border-blue-500 outline-none" value={newCardForm.creditLimit} onChange={e => setNewCardForm({...newCardForm, creditLimit: e.target.value})} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">الحساب البنكي المرتبط</label>
                                    <select className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl font-bold focus:border-blue-500 outline-none" value={newCardForm.linkedAccountId} onChange={e => setNewCardForm({...newCardForm, linkedAccountId: e.target.value})}>
                                        {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="pt-6 flex justify-end gap-4 border-t border-slate-800">
                                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg transition-all">حفظ واعتماد البطاقة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ControlStat = ({ label, val, color, bg, isText }) => (
    <div className={`${bg} border border-slate-800 p-6 rounded-[2rem] shadow-xl text-center flex flex-col justify-center`}>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{isText ? val : (val || 0).toLocaleString()} {!isText && <span className="text-[10px] opacity-50">ج.م</span>}</p>
    </div>
);

export default Cards;
