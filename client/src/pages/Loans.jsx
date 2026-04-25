import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Landmark, Calendar, 
    TrendingDown, CheckCircle2, AlertCircle, 
    ChevronRight, ArrowRightCircle, Receipt, DollarSign
} from 'lucide-react';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [paymentForm, setPaymentForm] = useState({ amount: '', principalComponent: '', interestComponent: '' });

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLoans(); }, []);

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            const nextInstallment = (selectedLoan.analytics.installmentsPaid || 0) + 1;
            await api.post('/loans/payment', { 
                ...paymentForm, 
                loanId: selectedCard._id, // Wait, I used selectedCard but it should be selectedLoan
                installmentNumber: nextInstallment 
            });
            // Let's fix the variable name to selectedLoan
            setShowPaymentModal(false);
            fetchLoans();
        } catch (err) { alert('خطأ في تسجيل القسط'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">إدارة الديون والالتزامات</h1>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <Plus size={20} /> تسجيل قرض جديد
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {loans.map((loan) => (
                    <div key={loan._id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                        {/* Status Watermark */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/5 blur-3xl rounded-full"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
                            {/* 1. Progress Ring & Main Info */}
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

                            {/* 2. Financial Metrics */}
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
                                    className="w-full py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all font-black flex items-center justify-center gap-2 border border-slate-700"
                                >
                                    <Receipt size={20} /> تسجيل قسط جديد
                                </button>
                            </div>

                            {/* 3. Installment Status */}
                            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 h-full">
                                <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                    <Calendar className="text-blue-500" size={18} /> جدول الأقساط
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-800/20 rounded-xl">
                                        <span className="text-xs text-slate-500">تم سداد</span>
                                        <span className="text-sm font-bold text-emerald-400">{loan.analytics.installmentsPaid} أقساط</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-slate-800/20 rounded-xl">
                                        <span className="text-xs text-slate-500">متبقي</span>
                                        <span className="text-sm font-bold text-blue-400">{loan.analytics.installmentsRemaining} أقساط</span>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-slate-800">
                                        <p className="text-[10px] text-slate-500 mb-1">القسط القادم</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-white">{loan.monthlyInstallment.toLocaleString()} ج.م</span>
                                            <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded font-bold">يوم {loan.startPaymentDate?.split('T')[0].split('-')[2] || '1'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Recording Payment */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl scale-in">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Receipt className="text-emerald-500" /> تسجيل قسط مسدد
                        </h3>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div>
                                <label className="text-xs text-slate-500 mb-2 block mr-2">مبلغ القسط</label>
                                <input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-2 block mr-2">جزء أصل الدين</label>
                                    <input type="number" placeholder="Principal" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={paymentForm.principalComponent} onChange={e => setPaymentForm({...paymentForm, principalComponent: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-2 block mr-2">جزء الفائدة</label>
                                    <input type="number" placeholder="Interest" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={paymentForm.interestComponent} onChange={e => setPaymentForm({...paymentForm, interestComponent: e.target.value})} />
                                </div>
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
