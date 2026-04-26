import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Landmark, Calendar, 
    TrendingDown, CheckCircle2, AlertCircle, 
    ChevronRight, ArrowRightCircle, Receipt, DollarSign, X
} from 'lucide-react';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [paymentForm, setPaymentForm] = useState({ amount: '', principalComponent: '', interestComponent: '' });
    const [newLoanForm, setNewLoanForm] = useState({
        loanName: '', lenderName: '', principalAmount: '', totalPayable: '', 
        monthlyInstallment: '', durationMonths: '', startPaymentDate: ''
    });

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans');
            setLoans(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLoans(); }, []);

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans', newLoanForm);
            setShowAddModal(false);
            setNewLoanForm({ loanName: '', lenderName: '', principalAmount: '', totalPayable: '', monthlyInstallment: '', durationMonths: '', startPaymentDate: '' });
            fetchLoans();
        } catch (err) { alert('خطأ في إضافة القرض'); }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            const nextInstallment = (selectedLoan.analytics?.installmentsPaid || 0) + 1;
            await api.post('/loans/payment', { 
                ...paymentForm, 
                loanId: selectedLoan._id, 
                installmentNumber: nextInstallment 
            });
            setShowPaymentModal(false);
            fetchLoans();
        } catch (err) { alert('خطأ في تسجيل القسط'); }
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
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center px-4 md:px-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white">إدارة القروض</h1>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 text-xs"
                >
                    <Plus size={18} /> تسجيل قرض
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10 px-4 md:px-0">
                {(Array.isArray(loans) ? loans : []).map((loan) => {
                    const analytics = loan.analytics || {};
                    return (
                        <div key={loan._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                            <div className="absolute top-8 left-8 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                                <button onClick={() => handleDelete(loan._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="relative w-40 h-40 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-500" strokeDasharray={440} strokeDashoffset={440 - (440 * (analytics.progressPercent || 0)) / 100} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute text-center">
                                            <p className="text-3xl font-black text-white">{analytics.progressPercent || 0}%</p>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white">{loan.loanName}</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
                                        <p className="text-xs text-blue-400 font-bold mb-2">المتبقي للسداد</p>
                                        <p className="text-3xl font-black text-white">{(analytics.remainingTotal || 0).toLocaleString()} <span className="text-sm">ج.م</span></p>
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedLoan(loan); setShowPaymentModal(true); setPaymentForm({amount: loan.monthlyInstallment, principalComponent: '', interestComponent: ''}); }}
                                        className="w-full py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all font-black flex items-center justify-center gap-2"
                                    >
                                        <Receipt size={20} /> تسجيل قسط
                                    </button>
                                </div>

                                <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 h-full">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-800/20 rounded-xl text-xs">
                                            <span className="text-slate-500">تم سداد</span>
                                            <span className="font-bold text-emerald-400">{analytics.installmentsPaid || 0} أقساط</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-800/20 rounded-xl text-xs">
                                            <span className="text-slate-500">متبقي</span>
                                            <span className="font-bold text-blue-400">{analytics.installmentsRemaining || 0} أقساط</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal إضافة قرض */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <Landmark className="text-blue-500" /> تسجيل قرض جديد
                        </h2>
                        <form onSubmit={handleCreateLoan} className="space-y-4 text-right" dir="rtl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">اسم القرض</label>
                                    <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.loanName} onChange={e => setNewLoanForm({...newLoanForm, loanName: e.target.value})} placeholder="مثلاً: قرض شخصي" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">جهة القرض</label>
                                    <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.lenderName} onChange={e => setNewLoanForm({...newLoanForm, lenderName: e.target.value})} placeholder="مثلاً: بنك مصر" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">أصل المبلغ</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.principalAmount} onChange={e => setNewLoanForm({...newLoanForm, principalAmount: e.target.value})} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">إجمالي الرد</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.totalPayable} onChange={e => setNewLoanForm({...newLoanForm, totalPayable: e.target.value})} placeholder="0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">القسط الشهري</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.monthlyInstallment} onChange={e => setNewLoanForm({...newLoanForm, monthlyInstallment: e.target.value})} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">المدة (شهور)</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.durationMonths} onChange={e => setNewLoanForm({...newLoanForm, durationMonths: e.target.value})} placeholder="12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">تاريخ أول قسط</label>
                                <input type="date" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newLoanForm.startPaymentDate} onChange={e => setNewLoanForm({...newLoanForm, startPaymentDate: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all mt-4">
                                حفظ القرض
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal تسجيل قسط */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-black text-white mb-6">تسجيل قسط القرض</h2>
                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">مبلغ القسط</label>
                                <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-center text-xl font-black" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all">
                                تأكيد السداد
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loans;
