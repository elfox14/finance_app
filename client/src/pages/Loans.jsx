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
        </div>
    );
};

export default Loans;
