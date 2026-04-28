import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Landmark, Calendar, 
    CheckCircle2, DollarSign, X,
    List, Info, PieChart as PieIcon, Crosshair, Building
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState(null);
    const [upcomingInstallments, setUpcomingInstallments] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [loanDetails, setLoanDetails] = useState({ installments: [], payments: [] });
    const [detailsTab, setDetailsTab] = useState('overview');

    const [newLoanForm, setNewLoanForm] = useState({
        loanName: '', lenderName: '', loanType: 'شخصي', principalAmount: '',
        interestRate: '0', durationMonths: '24', dueDay: '1', firstDueDate: '',
        totalPayable: '', monthlyInstallment: '', receivingAccountId: ''
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: '', principalPaid: '', interestPaid: '', paymentDate: new Date().toISOString().split('T')[0],
        sourceAccountId: '', note: '', installmentId: null
    });

    const fetchData = async () => {
        try {
            const [resLoans, resAccs] = await Promise.all([
                api.get('/loans'),
                api.get('/accounts')
            ]);
            setLoans(resLoans.data.loans || []);
            setStats(resLoans.data.stats || null);
            setUpcomingInstallments(resLoans.data.upcomingInstallments || []);
            setAccounts(resAccs.data || []);
            
            if (resAccs.data?.length > 0) {
                setNewLoanForm(f => ({ ...f, receivingAccountId: resAccs.data[0]._id }));
                setPaymentForm(f => ({ ...f, sourceAccountId: resAccs.data[0]._id }));
            }
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchLoanDetails = async (loanId) => {
        try {
            const res = await api.get(`/loans/details/${loanId}`);
            setLoanDetails(res.data);
            setShowDetailsModal(true);
        } catch (err) { alert('خطأ في جلب التفاصيل'); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans', newLoanForm);
            setShowAddModal(false);
            setNewLoanForm({ loanName: '', lenderName: '', loanType: 'شخصي', principalAmount: '', interestRate: '0', durationMonths: '24', dueDay: '1', firstDueDate: '', totalPayable: '', monthlyInstallment: '', receivingAccountId: accounts[0]?._id || '' });
            fetchData();
        } catch (err) { alert('خطأ في إضافة القرض'); }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans/payment', { 
                ...paymentForm, 
                loanId: selectedLoan._id,
                amount: Number(paymentForm.amount),
                principalPaid: Number(paymentForm.principalPaid),
                interestPaid: Number(paymentForm.interestPaid)
            });
            setShowPaymentModal(false);
            fetchLoanDetails(selectedLoan._id);
            fetchData();
        } catch (err) { alert('خطأ في تسجيل السداد'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا القرض؟')) return;
        try {
            await api.delete(`/loans/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const getLoanChartData = (loan) => {
        const paid = Number(loan.analytics?.principalPaid) || 0;
        const rem = Number(loan.analytics?.remainingPrincipal) || 0;
        return {
            labels: ['تم سداده من الأصل', 'المتبقي من الأصل'],
            datasets: [{
                data: [paid, rem],
                backgroundColor: ['#10b981', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    };

    const preparePaymentForm = (inst) => {
        setPaymentForm(f => ({
            ...f,
            installmentId: inst._id,
            amount: inst.amount,
            principalPaid: inst.principalPart || 0,
            interestPaid: inst.interestPart || 0
        }));
        setShowPaymentModal(true);
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">إدارة الالتزامات والقروض</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">متابعة دقيقة لأصل الدين والفوائد وجداول السداد</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/40">
                    <Plus size={20} /> تسجيل قرض جديد
                </button>
            </header>

            {/* 1) KPI Layer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                <ControlStat label="الرصيد القائم (أصل)" val={stats?.totalRemaining} color="text-white" bg="bg-blue-600" />
                <ControlStat label="إجمالي الأقساط الشهرية" val={stats?.totalMonthlyInstallments} color="text-indigo-400" bg="bg-slate-900" />
                <ControlStat label="المتأخرات" val={stats?.totalArrears} color={stats?.totalArrears > 0 ? 'text-red-500' : 'text-emerald-500'} bg="bg-slate-900" />
                <ControlStat label="الفوائد المدفوعة" val={stats?.totalInterestPaid} color="text-orange-500" bg="bg-slate-900" />
            </div>

            {/* Upcoming Installments Timeline */}
            <div className="px-4 md:px-0">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl p-8 overflow-hidden">
                    <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                        <Calendar className="text-orange-500" /> الأقساط القادمة
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {upcomingInstallments.map((inst, i) => (
                            <div key={i} className="min-w-[200px] bg-slate-800/50 p-5 rounded-3xl border border-slate-800 flex-shrink-0">
                                <p className="text-[10px] text-slate-500 font-bold mb-1">{inst.loanId?.loanName}</p>
                                <p className="text-xl font-black text-white">{inst.amount.toLocaleString()} ج.م</p>
                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-400">{new Date(inst.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
                                    <span className={inst.status === 'late' ? 'text-red-500 font-black' : 'text-orange-400 font-black'}>{inst.status === 'late' ? 'متأخر!' : 'قادم'}</span>
                                </div>
                            </div>
                        ))}
                        {upcomingInstallments.length === 0 && (
                            <div className="w-full text-center py-8 text-slate-500">لا توجد أقساط قادمة هذا الشهر</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2) Loans List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-0">
                {loans.map((loan) => {
                    const analytics = loan.analytics || {};
                    return (
                        <div key={loan._id} className="group relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl hover:border-blue-500/30 transition-all overflow-hidden flex flex-col gap-6">
                            <div className="absolute top-6 left-6">
                                <button onClick={() => handleDelete(loan._id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-white italic tracking-tight">{loan.loanName}</h3>
                                    <p className="text-slate-500 font-bold text-sm mt-1 flex items-center gap-1"><Building size={14}/> {loan.lenderName}</p>
                                </div>
                                <div className="w-16 h-16 relative">
                                    <Doughnut data={getLoanChartData(loan)} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{analytics.progressPercent}%</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/30 p-4 rounded-[1.5rem] border border-slate-800">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">المتبقي (أصل)</p>
                                    <p className="text-lg font-black text-blue-400">{(analytics.remainingPrincipal || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-800/30 p-4 rounded-[1.5rem] border border-slate-800">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">القسط الشهري</p>
                                    <p className="text-lg font-black text-emerald-400">{(loan.monthlyInstallment || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <p className="text-xs font-bold text-slate-400">القسط القادم: <span className="text-white">{new Date(loan.nextPaymentDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span></p>
                                <button 
                                    onClick={() => { setSelectedLoan(loan); setDetailsTab('overview'); fetchLoanDetails(loan._id); }}
                                    className="px-6 py-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all"
                                >
                                    إدارة القرض
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-5xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar text-right">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        
                        <div className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 italic flex items-center gap-3">
                                <Crosshair className="text-blue-500" /> {selectedLoan?.loanName}
                            </h2>
                            <div className="flex gap-4 mt-8 border-b border-slate-800">
                                {['overview', 'schedule', 'history'].map(tab => (
                                    <button 
                                        key={tab} onClick={() => setDetailsTab(tab)}
                                        className={`pb-4 px-6 text-lg font-black transition-all border-b-4 ${detailsTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {tab === 'overview' ? 'التفاصيل المالية' : tab === 'schedule' ? 'جدول الأقساط' : 'سجل السداد'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {detailsTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 space-y-6">
                                        <DetailRow label="أصل القرض المبدئي" val={selectedLoan?.principalAmount} />
                                        <DetailRow label="إجمالي الفوائد المتوقعة" val={selectedLoan?.totalPayable - selectedLoan?.principalAmount} color="orange" />
                                        <div className="pt-4 border-t border-slate-800 space-y-6">
                                            <DetailRow label="ما تم سداده (أصل)" val={selectedLoan?.analytics?.principalPaid} color="emerald" />
                                            <DetailRow label="ما تم سداده (فوائد)" val={selectedLoan?.analytics?.interestPaid} color="orange" />
                                            <DetailRow label="الرصيد المتبقي الفعلي (أصل)" val={selectedLoan?.analytics?.remainingPrincipal} color="blue" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-center items-center text-center">
                                        <PieIcon size={100} className="text-blue-500/20 mb-6" />
                                        <h4 className="text-2xl font-black text-white italic">إجمالي المتأخرات</h4>
                                        <p className="text-5xl font-black text-red-500 mt-4">{(selectedLoan?.analytics?.arrearsAmount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            {detailsTab === 'schedule' && (
                                <div className="space-y-4">
                                    {(loanDetails.installments || []).map(inst => (
                                        <div key={inst._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-900 rounded-[2rem] border border-slate-800">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center w-12 h-12 bg-slate-800 rounded-2xl flex flex-col items-center justify-center">
                                                    <p className="font-black text-white">{inst.installmentNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white mb-1">{new Date(inst.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric'})}</p>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-xl ${inst.status === 'paid' ? 'bg-emerald-900/30 text-emerald-400' : inst.status === 'late' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                                                        {inst.status === 'paid' ? 'تم السداد' : inst.status === 'late' ? 'متأخر' : 'غير مدفوع'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mt-4 md:mt-0">
                                                <div className="text-left flex items-center gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">أصل</p>
                                                        <p className="font-black text-slate-300">{inst.principalPart?.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-orange-500/70 font-bold uppercase">فائدة</p>
                                                        <p className="font-black text-orange-400">{inst.interestPart?.toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-2xl font-black text-white border-r border-slate-700 pr-4 ml-4">{inst.amount?.toLocaleString()}</p>
                                                </div>
                                                {inst.status !== 'paid' && (
                                                    <button onClick={() => preparePaymentForm(inst)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/30">
                                                        سداد
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {detailsTab === 'history' && (
                                <div className="space-y-4">
                                    {(loanDetails.payments || []).map(p => (
                                        <div key={p._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-emerald-900/10 rounded-[2rem] border border-emerald-500/20">
                                            <div className="flex items-center gap-6 mb-4 md:mb-0">
                                                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><CheckCircle2 size={24} /></div>
                                                <div>
                                                    <p className="font-black text-white text-lg">{p.paymentType}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(p.paymentDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})} • {p.sourceAccountId?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-slate-400">سداد الأصل: <span className="text-white">{p.principalPaid?.toLocaleString()}</span></p>
                                                    <p className="text-[10px] font-bold text-orange-400">سداد الفوائد: <span>{p.interestPaid?.toLocaleString()}</span></p>
                                                </div>
                                                <p className="text-2xl font-black text-emerald-400 border-r border-emerald-500/30 pr-4">{(p.amount || 0).toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><DollarSign className="text-emerald-500" /> تنفيذ السداد</h2>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">إجمالي المبلغ المسدد</label>
                                    <input type="number" required className="w-full bg-slate-800 text-white p-4 rounded-xl text-2xl font-black text-center outline-none focus:ring-1 ring-emerald-500" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">قيمة الأصل المخصوم</label>
                                        <input type="number" className="w-full bg-slate-800 text-white p-3 rounded-xl font-black text-center outline-none" value={paymentForm.principalPaid} onChange={e => setPaymentForm({...paymentForm, principalPaid: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-orange-500/70 font-bold uppercase mb-1 block">قيمة الفائدة (المصروف)</label>
                                        <input type="number" className="w-full bg-slate-800 text-orange-400 p-3 rounded-xl font-black text-center outline-none" value={paymentForm.interestPaid} onChange={e => setPaymentForm({...paymentForm, interestPaid: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">الحساب المخصوم منه</label>
                                <select className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-[1.5rem] font-bold outline-none focus:border-emerald-500" value={paymentForm.sourceAccountId} onChange={e => setPaymentForm({...paymentForm, sourceAccountId: e.target.value})}>
                                    {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </select>
                            </div>
                            
                            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/30 transition-all mt-4">اعتماد السداد وتوجيه القيود</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Loan Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-3xl rounded-[3rem] p-10 relative shadow-2xl text-right overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 italic">
                            <Landmark className="text-blue-500" /> إضافة قرض وإنشاء جدول السداد
                        </h2>
                        <form onSubmit={handleCreateLoan} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">اسم القرض</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl font-bold focus:border-blue-500 outline-none" value={newLoanForm.loanName} onChange={e => setNewLoanForm({...newLoanForm, loanName: e.target.value})} placeholder="قرض سيارة" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">جهة القرض / الدائن</label>
                                    <input required className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl font-bold focus:border-blue-500 outline-none" value={newLoanForm.lenderName} onChange={e => setNewLoanForm({...newLoanForm, lenderName: e.target.value})} placeholder="البنك الأهلي" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">مبلغ القرض المستلم (الأصل)</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-blue-400 p-4 rounded-2xl font-black text-xl outline-none" value={newLoanForm.principalAmount} onChange={e => setNewLoanForm({...newLoanForm, principalAmount: e.target.value})} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">إجمالي المبلغ المراد سداده</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl font-black text-xl outline-none" value={newLoanForm.totalPayable} onChange={e => setNewLoanForm({...newLoanForm, totalPayable: e.target.value})} placeholder="يضم الفوائد" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">الحساب المستلم للأموال</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl font-bold outline-none focus:border-blue-500" value={newLoanForm.receivingAccountId} onChange={e => setNewLoanForm({...newLoanForm, receivingAccountId: e.target.value})}>
                                        {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">المدة بالشهور</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl font-black text-center focus:border-blue-500 outline-none" value={newLoanForm.durationMonths} onChange={e => setNewLoanForm({...newLoanForm, durationMonths: e.target.value})} placeholder="24" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">تاريخ أول قسط</label>
                                    <input type="date" className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl font-bold focus:border-blue-500 outline-none" value={newLoanForm.firstDueDate} onChange={e => setNewLoanForm({...newLoanForm, firstDueDate: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">قيمة القسط الشهري (اختياري)</label>
                                    <input type="number" className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl font-black text-center focus:border-blue-500 outline-none" value={newLoanForm.monthlyInstallment} onChange={e => setNewLoanForm({...newLoanForm, monthlyInstallment: e.target.value})} placeholder="يُحسب آلياً" />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-4 border-t border-slate-800">
                                <button type="button" onClick={() => setShowAddModal(false)} className="py-4 px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black transition-all">إلغاء</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/30 transition-all">تأكيد وجدولة الأقساط آلياً</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ControlStat = ({ label, val, color, bg }) => (
    <div className={`${bg} border border-slate-800 p-6 rounded-[2rem] shadow-xl text-center flex flex-col justify-center`}>
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{(val || 0).toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span></p>
    </div>
);

const DetailRow = ({ label, val, color }) => (
    <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
        <span className="text-slate-400 font-bold">{label}</span>
        <span className={`font-black ${color === 'orange' ? 'text-orange-400' : color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-white'}`}>
            {(Number(val) || 0).toLocaleString()}
        </span>
    </div>
);

export default Loans;
