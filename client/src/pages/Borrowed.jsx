import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, User, Calendar, 
    Handshake, CheckCircle2, AlertTriangle, 
    Edit2, X, Receipt, ArrowRightCircle, Wallet
} from 'lucide-react';

const Borrowed = () => {
    const [debts, setDebts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ personName: '', amount: '', dueDate: '', note: '', type: 'borrowed', accountId: '' });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentAccountId, setPaymentAccountId] = useState('');

    const fetchData = async () => {
        try {
            const [debtRes, accRes] = await Promise.all([
                api.get('/peer-debts'),
                api.get('/accounts')
            ]);
            
            const allDebts = Array.isArray(debtRes.data.debts) ? debtRes.data.debts : [];
            setDebts(allDebts.filter(d => d.type === 'borrowed'));
            setStats(debtRes.data.stats);
            setAccounts(accRes.data);

            if (accRes.data.length > 0) {
                if (!form.accountId) setForm(prev => ({ ...prev, accountId: accRes.data[0]._id }));
                if (!paymentAccountId) setPaymentAccountId(accRes.data[0]._id);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!paymentAccountId) { alert('يرجى اختيار الحساب'); return; }
        try {
            await api.post('/peer-debts/payment', { 
                debtId: selectedDebt._id, 
                amount: Number(paymentAmount),
                accountId: paymentAccountId
            });
            setShowPaymentModal(false);
            setPaymentAmount('');
            fetchData();
        } catch (err) { alert('خطأ في تسجيل الدفعة'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.accountId) { alert('يرجى اختيار الحساب'); return; }
        try {
            const dataToSend = { ...form, amount: Number(form.amount) };
            await api.post('/peer-debts', dataToSend);
            setForm({ personName: '', amount: '', dueDate: '', note: '', type: 'borrowed', accountId: accounts[0]?._id || '' });
            fetchData();
            alert('تم تسجيل المديونية وزيادة رصيد الحساب');
        } catch (err) { alert('خطأ في الحفظ'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/peer-debts/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <h1 className="text-3xl font-black text-white italic tracking-tighter">الديون المستحقة (سلف عليك)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-900/40 relative overflow-hidden group">
                    <AlertTriangle size={100} className="absolute -bottom-4 -left-4 opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-red-100 text-xs mb-1 font-bold">إجمالي المديونية الحالية</p>
                    <p className="text-4xl font-black">{stats?.totalBorrowedRemaining?.toLocaleString() || 0} <span className="text-sm font-normal">ج.م</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Sidebar */}
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl h-fit">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <Plus className="text-red-500" /> تسجيل سلفة جديدة
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-2">اسم الدائن</label>
                            <input placeholder="ممن استلفت؟" className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-red-500" value={form.personName} onChange={e => setForm({...form, personName: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-2">المبلغ</label>
                            <input type="number" placeholder="0.00" className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl outline-none font-black text-xl focus:border-red-500" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 mr-2">إيداع في حساب</label>
                                {Array.isArray(accounts) && accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} ({acc.balance.toLocaleString()} ج.م)</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full py-4 bg-red-600 rounded-2xl font-black text-white shadow-xl shadow-red-900/40 hover:bg-red-500 transition-all">حفظ المديونية</button>
                    </form>
                </div>

                {/* List Area */}
                <div className="lg:col-span-2 space-y-6">
                    {(Array.isArray(debts) ? debts : []).map((debt) => {
                        const analytics = debt.analytics || {};
                        return (
                            <div key={debt._id} className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${debt.isPaid ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 shadow-xl hover:border-red-500/30'}`}>
                                <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
                                    <button onClick={() => handleDelete(debt._id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${debt.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {debt.isPaid ? <CheckCircle2 size={32} /> : <User size={32} />}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white">{debt.personName}</h4>
                                            <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2">
                                                <Calendar size={12}/> بدأ في {new Date(debt.date).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8 flex-1 md:flex-none text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-tighter">إجمالي الدين</p>
                                            <p className="font-bold text-white text-base">{debt.amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-500 mb-2 font-black uppercase tracking-tighter">المسدد</p>
                                            <p className="font-bold text-emerald-400 text-base">{analytics.paidAmount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-red-500 mb-2 font-black uppercase tracking-tighter">المتبقي</p>
                                            <p className="font-black text-white text-base">{analytics.remainingAmount?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {!debt.isPaid && (
                                        <button onClick={() => { setSelectedDebt(debt); setShowPaymentModal(true); }} className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-red-900/30">
                                            <Receipt size={24} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white"><X size={24}/></button>
                        <h2 className="text-2xl font-black text-white mb-8">سداد جزء من المديونية</h2>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-2">المبلغ المدفوع</label>
                                <input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl font-black text-2xl outline-none focus:border-red-500" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-2">الخصم من حساب</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl font-bold outline-none focus:border-red-500" value={paymentAccountId} onChange={e => setPaymentAccountId(e.target.value)} required>
                                    <option value="">اختر الحساب...</option>
                                    {Array.isArray(accounts) && accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} ({acc.balance.toLocaleString()} ج.م)</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-red-600 rounded-2xl font-black text-white shadow-xl shadow-red-900/40 hover:bg-red-500 transition-all text-lg">تأكيد السداد</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Borrowed;
