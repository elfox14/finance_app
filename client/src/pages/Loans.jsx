import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Landmark, Calendar, 
    TrendingDown, CheckCircle2, AlertCircle, 
    ChevronRight, ArrowRightCircle, Receipt, DollarSign, X,
    Percent, Clock, ShieldCheck, Sparkles, History,
    BarChart3, List, Wallet, Info, ChevronLeft
} from 'lucide-react';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanDetails, setLoanDetails] = useState({ installments: [], payments: [] });
    const [detailsTab, setDetailsTab] = useState('overview');

    const [newLoanForm, setNewLoanForm] = useState({
        loanName: '', lenderName: '', loanType: 'شخصي', principalAmount: '',
        interestRate: '10', durationMonths: '24', dueDay: '1', firstDueDate: '',
        totalPayable: '', monthlyInstallment: ''
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: '', paymentDate: new Date().toISOString().split('T')[0],
        paymentType: 'قسط دوري', sourceAccount: 'كاش', note: '', installmentId: null
    });

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans');
            setLoans(res.data.loans || []);
            setStats(res.data.stats || null);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchLoanDetails = async (loanId) => {
        try {
            const res = await api.get(`/loans/details/${loanId}`);
            setLoanDetails(res.data);
            setShowDetailsModal(true);
        } catch (err) { alert('خطأ في جلب التفاصيل'); }
    };

    useEffect(() => { fetchLoans(); }, []);

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans', newLoanForm);
            setShowAddModal(false);
            setNewLoanForm({ loanName: '', lenderName: '', loanType: 'شخصي', principalAmount: '', interestRate: '10', durationMonths: '24', dueDay: '1', firstDueDate: '', totalPayable: '', monthlyInstallment: '' });
            fetchLoans();
        } catch (err) { alert('خطأ في إضافة القرض'); }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans/payment', { 
                ...paymentForm, 
                loanId: selectedLoan._id,
                amount: Number(paymentForm.amount)
            });
            setShowPaymentModal(false);
            setShowDetailsModal(false);
            fetchLoans();
        } catch (err) { alert('خطأ في تسجيل السداد'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا القرض؟')) return;
        try {
            await api.delete(`/loans/${id}`);
            fetchLoans();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20 px-4 md:px-0" dir="rtl">
            {/* 1) Analytics Header */}
            <header className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">إدارة دورة حياة القروض</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تخطيط، جدولة، ومتابعة سداد الديون</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">إجمالي المتبقي</p>
                    <p className="text-xl font-black text-white">{stats?.totalRemaining?.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                </div>
                <div className="bg-blue-600 border border-blue-500 p-5 rounded-3xl shadow-lg shadow-blue-900/20">
                    <p className="text-[10px] text-blue-100 font-bold uppercase mb-1">إجمالي أقساط الشهر</p>
                    <p className="text-xl font-black text-white">{stats?.monthlyTotal?.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                </div>
            </header>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400">
                        <Info size={14} className="text-blue-500" /> عبء الدين العام: {stats?.overallDTI}%
                    </div>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm shadow-lg shadow-emerald-900/20">
                    <Plus size={18} /> تسجيل قرض جديد
                </button>
            </div>

            {/* 2) Loans List */}
            <div className="grid grid-cols-1 gap-8">
                {loans.map((loan) => {
                    const analytics = loan.analytics || {};
                    return (
                        <div key={loan._id} className="group relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl hover:border-blue-500/30 transition-all overflow-hidden">
                            <div className="absolute top-10 left-10">
                                <button onClick={() => handleDelete(loan._id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 items-center">
                                {/* Circular Progress */}
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-blue-500" strokeDasharray={364} strokeDashoffset={364 - (364 * (analytics.progressPercent || 0)) / 100} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute text-center">
                                            <p className="text-2xl font-black text-white">{analytics.progressPercent || 0}%</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${loan.status === 'نشط' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {loan.status}
                                    </span>
                                </div>

                                {/* Loan Main Info */}
                                <div className="lg:col-span-2 space-y-6 text-center lg:text-right">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight">{loan.loanName}</h3>
                                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">{loan.lenderName} • {loan.loanType}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">أصل القرض</p>
                                            <p className="text-sm font-black text-white">{loan.principalAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">القسط الشهري</p>
                                            <p className="text-sm font-black text-blue-500">{loan.monthlyInstallment?.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">المتبقي</p>
                                            <p className="text-sm font-black text-emerald-500">{analytics.remainingTotal?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-3xl text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">القسط القادم</p>
                                        <p className="text-xs font-black text-white">{new Date(loan.nextPaymentDate).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedLoan(loan); setDetailsTab('overview'); fetchLoanDetails(loan._id); }}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                    >
                                        <List size={20} /> إدارة الدورة
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3) Details Modal (The Lifecycle Center) */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar text-right">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-white mb-2 italic">دورة القرض: {selectedLoan?.loanName}</h2>
                            <div className="flex gap-4 mt-8 border-b border-slate-800">
                                {['overview', 'schedule', 'history'].map(tab => (
                                    <button 
                                        key={tab} onClick={() => setDetailsTab(tab)}
                                        className={`pb-4 px-2 text-sm font-black transition-all border-b-2 ${detailsTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500'}`}
                                    >
                                        {tab === 'overview' ? 'نظرة عامة' : tab === 'schedule' ? 'جدول الأقساط' : 'سجل السداد'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {detailsTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 space-y-6">
                                        <h4 className="font-black text-white mb-4">التفاصيل المالية</h4>
                                        <DetailRow label="أصل القرض" val={selectedLoan?.principalAmount} />
                                        <DetailRow label="إجمالي الفوائد" val={selectedLoan?.totalPayable - selectedLoan?.principalAmount} color="orange" />
                                        <DetailRow label="إجمالي المبلغ المراد رده" val={selectedLoan?.totalPayable} color="blue" />
                                        <div className="pt-4 border-t border-slate-800">
                                            <DetailRow label="إجمالي ما تم سداده" val={selectedLoan?.paidAmount} color="emerald" />
                                            <DetailRow label="المتبقي حالياً" val={selectedLoan?.remainingAmount} color="blue" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-center items-center text-center">
                                        <PieChart size={64} className="text-blue-500 opacity-20 mb-4" />
                                        <h4 className="text-xl font-black text-white italic">عبء الدين الشخصي</h4>
                                        <p className="text-5xl font-black text-white mt-4">{selectedLoan?.analytics?.debtBurden}%</p>
                                        <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">DTI Ratio for this Loan</p>
                                    </div>
                                </div>
                            )}

                            {detailsTab === 'schedule' && (
                                <div className="space-y-3">
                                    {loanDetails.installments.map(inst => (
                                        <div key={inst._id} className="flex items-center justify-between p-5 bg-slate-900 rounded-3xl border border-slate-800 group hover:border-slate-700 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center w-10">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">قسط</p>
                                                    <p className="font-black text-white">{inst.installmentNumber}</p>
                                                </div>
                                                <div className="h-10 w-px bg-slate-800"></div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{new Date(inst.dueDate).toLocaleDateString('ar-EG')}</p>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg ${inst.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                                        {inst.status === 'paid' ? 'تم السداد' : 'غير مدفوع'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-lg font-black text-white">{inst.amount?.toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span></p>
                                                {inst.status !== 'paid' && (
                                                    <button 
                                                        onClick={() => { setPaymentForm({...paymentForm, amount: inst.amount, installmentId: inst._id}); setShowPaymentModal(true); }}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-500 transition-all"
                                                    >
                                                        سداد القسط
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {detailsTab === 'history' && (
                                <div className="space-y-3">
                                    {loanDetails.payments.map(p => (
                                        <div key={p._id} className="flex items-center justify-between p-5 bg-emerald-900/10 rounded-3xl border border-emerald-500/20">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><CheckCircle2 size={20} /></div>
                                                <div>
                                                    <p className="font-black text-white">{p.paymentType}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(p.paymentDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-emerald-500">{p.amount?.toLocaleString()} ج.م</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 4) Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-sm rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic"><DollarSign className="text-blue-500" /> تأكيد سداد قسط</h2>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">المبلغ المراد سداده</label>
                                <input 
                                    type="number" required 
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] text-2xl font-black text-center focus:border-blue-500 outline-none transition-all" 
                                    value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">الحساب المحول منه</label>
                                <select className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none" value={paymentForm.sourceAccount} onChange={e => setPaymentForm({...paymentForm, sourceAccount: e.target.value})}>
                                    <option value="كاش">كاش / نقدي</option><option value="بنك">حساب بنكي</option><option value="محفظة">محفظة إلكترونية</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/20 transition-all">تأكيد السداد وتعديل المتبقي</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 5) Add Loan Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl text-right overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic">
                            <Landmark className="text-blue-500" /> تسجيل قرض جديد بجدولة آليّة
                        </h2>
                        <form onSubmit={handleCreateLoan} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">اسم القرض</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newLoanForm.loanName} onChange={e => setNewLoanForm({...newLoanForm, loanName: e.target.value})} placeholder="قرض سيارة، شخصي..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">جهة القرض</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newLoanForm.lenderName} onChange={e => setNewLoanForm({...newLoanForm, lenderName: e.target.value})} placeholder="البنك، شركة تمويل..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">أصل القرض</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl" value={newLoanForm.principalAmount} onChange={e => setNewLoanForm({...newLoanForm, principalAmount: e.target.value})} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">نسبة الفائدة %</label>
                                    <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl" value={newLoanForm.interestRate} onChange={e => setNewLoanForm({...newLoanForm, interestRate: e.target.value})} placeholder="10" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">المدة بالشهور</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl" value={newLoanForm.durationMonths} onChange={e => setNewLoanForm({...newLoanForm, durationMonths: e.target.value})} placeholder="24" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 px-4 font-bold uppercase">يوم القسط الشهري</label>
                                    <input type="number" min="1" max="31" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-center" value={newLoanForm.dueDay} onChange={e => setNewLoanForm({...newLoanForm, dueDay: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/20 transition-all mt-4">حفظ وجدولة القرض آلياً</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ label, val, color }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500 font-bold">{label}</span>
        <span className={`font-black ${color === 'orange' ? 'text-orange-500' : color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-white'}`}>
            {(Number(val) || 0).toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span>
        </span>
    </div>
);

export default Loans;
