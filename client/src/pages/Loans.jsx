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
            setLoans(res.data);
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
            const nextInstallment = (selectedLoan.analytics.installmentsPaid || 0) + 1;
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">إدارة الديون والالتزامات</h1>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <Plus size={20} /> تسجيل قرض جديد
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {loans.map((loan) => (
                    <div key={loan._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                        {/* Action Buttons: Always visible on Mobile, hover on Desktop */}
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
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-500" strokeDasharray={440} strokeDashoffset={440 - (440 * loan.analytics.progressPercent) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute text-center">
                                        <p className="text-3xl font-black text-white">{loan.analytics.progressPercent}%</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">نسبة السداد</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">{loan.loanName}</h3>
                                    <p className="text-slate-500 text-sm font-medium">{loan.lenderName}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                        <p className="text-slate-500 text-[10px] mb-1">أصل القرض</p>
                                        <p className="font-black text-white">{loan.principalAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                        <p className="text-slate-500 text-[10px] mb-1">إجمالي الرد</p>
                                        <p className="font-black text-white">{loan.totalPayable.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-blue-400 font-bold">المتبقي للسداد</span>
                                        <span className="text-xs text-blue-500 font-black">عبء الدخل: {loan.analytics.debtBurden}%</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{loan.analytics.remainingTotal.toLocaleString()} <span className="text-sm">ج.م</span></p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedLoan(loan); setShowPaymentModal(true); setPaymentForm({amount: loan.monthlyInstallment, principalComponent: '', interestComponent: ''}); }}
                                    className="w-full py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all font-black flex items-center justify-center gap-2 border border-slate-700 shadow-lg shadow-blue-900/10"
                                >
                                    <Receipt size={20} /> تسجيل قسط جديد
                                </button>
                            </div>

                            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 h-full">
                                <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                    <Calendar className="text-blue-500" size={18} /> جدول الأقساط
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-800/20 rounded-xl text-xs">
                                        <span className="text-slate-500">تم سداد</span>
                                        <span className="font-bold text-emerald-400">{loan.analytics.installmentsPaid} أقساط</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-800/20 rounded-xl text-xs">
                                        <span className="text-slate-500">متبقي</span>
                                        <span className="font-bold text-blue-400">{loan.analytics.installmentsRemaining} أقساط</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Creating Loan */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl scale-in overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Landmark className="text-blue-500" /> تسجيل قرض جديد</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X /></button>
                        </div>
                        <form onSubmit={handleCreateLoan} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="اسم القرض" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.loanName} onChange={e => setNewLoanForm({...newLoanForm, loanName: e.target.value})} required />
                                <input placeholder="جهة القرض" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.lenderName} onChange={e => setNewLoanForm({...newLoanForm, lenderName: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="أصل القرض" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.principalAmount} onChange={e => setNewLoanForm({...newLoanForm, principalAmount: e.target.value})} required />
                                <input type="number" placeholder="إجمالي الرد" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.totalPayable} onChange={e => setNewLoanForm({...newLoanForm, totalPayable: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="القسط الشهري" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.monthlyInstallment} onChange={e => setNewLoanForm({...newLoanForm, monthlyInstallment: e.target.value})} required />
                                <input type="number" placeholder="المدة (شهور)" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.durationMonths} onChange={e => setNewLoanForm({...newLoanForm, durationMonths: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 mr-2">تاريخ بداية السداد</label>
                                <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newLoanForm.startPaymentDate} onChange={e => setNewLoanForm({...newLoanForm, startPaymentDate: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl font-black text-white shadow-lg">حفظ القرض</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Recording Payment */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl scale-in">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Receipt className="text-emerald-500" /> تسجيل قسط مسدد لـ {selectedLoan?.loanName}
                        </h3>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div>
                                <label className="text-xs text-slate-500 mb-2 block mr-2">مبلغ القسط</label>
                                <input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-slate-500 font-bold">إلغاء</button>
                                <button type="submit" className="flex-1 py-4 bg-emerald-600 rounded-xl font-black text-white shadow-lg shadow-emerald-900/20">تأكيد السداد</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loans;
