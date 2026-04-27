import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Landmark, Calendar, 
    CheckCircle2, DollarSign, X,
    List, Info, PieChart as PieIcon, Crosshair
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const getLoanChartData = (loan) => {
        const paid = Number(loan.paidAmount) || 0;
        const rem = Number(loan.remainingAmount) || 0;
        return {
            labels: ['تم سداده', 'المتبقي'],
            datasets: [{
                data: [paid, rem],
                backgroundColor: ['#10b981', '#3b82f6'],
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
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">إدارة القروض</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">تخطيط، جدولة، ومتابعة سداد الديون بذكاء</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-6 py-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-xs font-bold text-slate-400">
                        <Info size={16} className="text-blue-500" /> عبء الدين العام: <span className="text-white text-lg ml-1">{stats?.overallDTI}%</span>
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/40">
                        <Plus size={20} /> تسجيل قرض جديد
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Global Stats */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Landmark size={120} className="text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-8 relative z-10">
                            <Landmark className="text-blue-500" /> إجمالي المديونية (المتبقي)
                        </h3>
                        <p className="text-5xl font-black text-white relative z-10">{stats?.totalRemaining?.toLocaleString() || 0} <span className="text-xl opacity-50">ج.م</span></p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 border border-blue-500/30 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Calendar size={120} className="text-white" />
                        </div>
                        <h3 className="text-xl font-black text-blue-200 flex items-center gap-2 mb-8 relative z-10">
                            <Calendar className="text-blue-400" /> إجمالي أقساط هذا الشهر
                        </h3>
                        <p className="text-5xl font-black text-white relative z-10">{stats?.monthlyTotal?.toLocaleString() || 0} <span className="text-xl opacity-50">ج.م</span></p>
                    </div>
                </div>

                {/* 2) Loans List */}
                <div className="lg:col-span-3 space-y-8">
                    {loans.map((loan) => {
                        const analytics = loan.analytics || {};
                        return (
                            <div key={loan._id} className="group relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl hover:border-blue-500/30 transition-all overflow-hidden flex flex-col lg:flex-row gap-8 items-center">
                                <div className="absolute top-8 left-8">
                                    <button onClick={() => handleDelete(loan._id)} className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {/* Circular Progress (Doughnut) */}
                                <div className="w-40 h-40 relative flex-shrink-0 flex items-center justify-center">
                                    <Doughnut data={getLoanChartData(loan)} options={doughnutOptions} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-2xl font-black text-white">{analytics.progressPercent || 0}%</p>
                                    </div>
                                    <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black px-4 py-1 rounded-xl ${loan.status === 'نشط' ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30'}`}>
                                        {loan.status}
                                    </span>
                                </div>

                                {/* Loan Main Info */}
                                <div className="flex-1 space-y-6 text-center lg:text-right w-full">
                                    <div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tight">{loan.loanName}</h3>
                                        <p className="text-slate-500 font-bold text-sm mt-2">{loan.lenderName} • {loan.loanType}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-800/30 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-800 flex flex-col justify-center text-center md:text-right">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1 md:mb-2">أصل القرض</p>
                                            <p className="text-base md:text-lg font-black text-white">{loan.principalAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-800/30 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-800 flex flex-col justify-center text-center md:text-right">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1 md:mb-2">القسط الشهري</p>
                                            <p className="text-base md:text-lg font-black text-blue-500">{(Number(loan.monthlyInstallment) || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-800/30 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-800 flex flex-col justify-center text-center md:text-right">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1 md:mb-2">المتبقي</p>
                                            <p className="text-base md:text-lg font-black text-emerald-500">{(Number(analytics.remainingTotal) || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-4 w-full lg:w-64 flex-shrink-0">
                                    <div className="p-6 bg-slate-800/30 border border-slate-800 rounded-[2rem] text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">تاريخ القسط القادم</p>
                                        <p className="text-sm font-black text-white">{new Date(loan.nextPaymentDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <button 
                                        onClick={() => { setSelectedLoan(loan); setDetailsTab('overview'); fetchLoanDetails(loan._id); }}
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30 text-lg"
                                    >
                                        <List size={20} /> إدارة الدورة
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {loans.length === 0 && (
                        <div className="py-24 text-center bg-slate-900 border-2 border-slate-800 border-dashed rounded-[3rem]">
                            <Landmark size={64} className="mx-auto mb-6 text-slate-700" />
                            <p className="font-bold text-white text-xl">لا توجد قروض مسجلة</p>
                            <p className="text-slate-500 text-sm mt-2">أضف قروضك لتتم إدارتها وجدولتها آلياً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3) Details Modal (The Lifecycle Center) */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-5xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar text-right">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        
                        <div className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 italic flex items-center gap-3">
                                <Crosshair className="text-blue-500" /> دورة القرض: {selectedLoan?.loanName}
                            </h2>
                            <div className="flex gap-4 mt-8 border-b border-slate-800">
                                {['overview', 'schedule', 'history'].map(tab => (
                                    <button 
                                        key={tab} onClick={() => setDetailsTab(tab)}
                                        className={`pb-4 px-6 text-lg font-black transition-all border-b-4 ${detailsTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {tab === 'overview' ? 'نظرة عامة' : tab === 'schedule' ? 'جدول الأقساط' : 'سجل السداد'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {detailsTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 space-y-8">
                                        <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2"><DollarSign className="text-emerald-500"/> التفاصيل المالية</h4>
                                        <DetailRow label="أصل القرض" val={selectedLoan?.principalAmount} />
                                        <DetailRow label="إجمالي الفوائد" val={selectedLoan?.totalPayable - selectedLoan?.principalAmount} color="orange" />
                                        <DetailRow label="إجمالي المبلغ المراد رده" val={selectedLoan?.totalPayable} color="blue" />
                                        <div className="pt-6 border-t border-slate-800">
                                            <DetailRow label="إجمالي ما تم سداده" val={selectedLoan?.paidAmount} color="emerald" />
                                            <DetailRow label="المتبقي حالياً" val={selectedLoan?.remainingAmount} color="blue" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                            <PieIcon size={150} className="text-orange-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="text-2xl font-black text-white italic">عبء الدين الشخصي</h4>
                                            <p className="text-6xl font-black text-white mt-6">{selectedLoan?.analytics?.debtBurden}%</p>
                                            <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest">DTI Ratio for this Loan</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailsTab === 'schedule' && (
                                <div className="space-y-4">
                                    {loanDetails.installments.map(inst => (
                                        <div key={inst._id} className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] border border-slate-800 group hover:border-slate-700 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center w-12 h-12 bg-slate-800 rounded-2xl flex flex-col items-center justify-center">
                                                    <p className="text-[8px] text-slate-500 font-bold uppercase">قسط</p>
                                                    <p className="font-black text-white">{inst.installmentNumber}</p>
                                                </div>
                                                <div className="h-12 w-px bg-slate-800"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-1">{new Date(inst.dueDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-xl ${inst.status === 'paid' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                                        {inst.status === 'paid' ? 'تم السداد' : 'غير مدفوع'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <p className="text-2xl font-black text-white">{inst.amount?.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                                {inst.status !== 'paid' && (
                                                    <button 
                                                        onClick={() => { setPaymentForm({...paymentForm, amount: inst.amount, installmentId: inst._id}); setShowPaymentModal(true); }}
                                                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/30 transition-all"
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
                                <div className="space-y-4">
                                    {loanDetails.payments.length === 0 ? (
                                        <div className="py-20 text-center text-slate-500">لا توجد عمليات سداد مسجلة بعد</div>
                                    ) : (
                                        loanDetails.payments.map(p => (
                                            <div key={p._id} className="flex items-center justify-between p-6 bg-emerald-900/10 rounded-[2rem] border border-emerald-500/20">
                                                <div className="flex items-center gap-6">
                                                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><CheckCircle2 size={24} /></div>
                                                    <div>
                                                        <p className="font-black text-white text-lg mb-1">{p.paymentType}</p>
                                                        <p className="text-xs text-slate-500">{new Date(p.paymentDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                                    </div>
                                                </div>
                                                <p className="text-2xl font-black text-emerald-400">{p.amount?.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 4) Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><DollarSign className="text-emerald-500" /> تأكيد سداد قسط</h2>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">المبلغ المراد سداده</label>
                                <input 
                                    type="number" required 
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] text-3xl font-black text-center focus:border-emerald-500 outline-none transition-all" 
                                    value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">تاريخ السداد</label>
                                <input 
                                    type="date" required 
                                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 p-5 rounded-[2rem] font-bold text-center focus:border-emerald-500 outline-none transition-all" 
                                    value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">الحساب المحول منه</label>
                                <select className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] font-bold outline-none focus:border-emerald-500" value={paymentForm.sourceAccount} onChange={e => setPaymentForm({...paymentForm, sourceAccount: e.target.value})}>
                                    <option value="كاش">كاش / نقدي</option><option value="بنك">حساب بنكي</option><option value="محفظة">محفظة إلكترونية</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/30 transition-all mt-4">تأكيد السداد وتحديث الرصيد</button>
                        </form>
                    </div>
                </div>
            )}

            {/* 5) Add Loan Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border-2 border-blue-500/30 w-full max-w-3xl rounded-[3rem] p-10 relative shadow-2xl text-right overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic">
                            <Landmark className="text-blue-500" /> تسجيل قرض جديد بجدولة آليّة
                        </h2>
                        <form onSubmit={handleCreateLoan} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">اسم القرض</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newLoanForm.loanName} onChange={e => setNewLoanForm({...newLoanForm, loanName: e.target.value})} placeholder="مثال: قرض السيارة، قرض شخصي..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">جهة القرض / الدائن</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" value={newLoanForm.lenderName} onChange={e => setNewLoanForm({...newLoanForm, lenderName: e.target.value})} placeholder="البنك الأهلي، شركة التمويل..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">أصل القرض (ج.م)</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl focus:border-blue-500 outline-none" value={newLoanForm.principalAmount} onChange={e => setNewLoanForm({...newLoanForm, principalAmount: e.target.value})} placeholder="0" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">نسبة الفائدة الكلية %</label>
                                    <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl focus:border-blue-500 outline-none" value={newLoanForm.interestRate} onChange={e => setNewLoanForm({...newLoanForm, interestRate: e.target.value})} placeholder="10" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">المدة بالشهور</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl focus:border-blue-500 outline-none" value={newLoanForm.durationMonths} onChange={e => setNewLoanForm({...newLoanForm, durationMonths: e.target.value})} placeholder="24" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">يوم استحقاق القسط الشهري</label>
                                    <input type="number" min="1" max="31" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-center focus:border-blue-500 outline-none" value={newLoanForm.dueDay} onChange={e => setNewLoanForm({...newLoanForm, dueDay: e.target.value})} placeholder="1" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold uppercase">تاريخ سداد أول قسط (اختياري)</label>
                                <input type="date" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold focus:border-blue-500 outline-none" value={newLoanForm.firstDueDate} onChange={e => setNewLoanForm({...newLoanForm, firstDueDate: e.target.value})} />
                            </div>
                            <div className="pt-4 flex justify-end gap-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="py-5 px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black transition-all">إلغاء</button>
                                <button type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/30 transition-all">تأكيد وجدولة الأقساط آلياً</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow = ({ label, val, color }) => (
    <div className="flex justify-between items-center text-lg">
        <span className="text-slate-400 font-bold">{label}</span>
        <span className={`font-black ${color === 'orange' ? 'text-orange-500' : color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-white'}`}>
            {(Number(val) || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span>
        </span>
    </div>
);

export default Loans;
