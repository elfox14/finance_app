import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, User, Calendar, 
    Handshake, CheckCircle2, AlertTriangle, 
    Edit2, X, Receipt, ArrowRightCircle
} from 'lucide-react';

const Borrowed = () => {
    const [debts, setDebts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ personName: '', amount: '', dueDate: '', note: '', type: 'borrowed' });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/peer-debts');
            setDebts(res.data.debts.filter(d => d.type === 'borrowed'));
            setStats(res.data.stats);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/peer-debts/payment', { debtId: selectedDebt._id, amount: paymentAmount });
            setShowPaymentModal(false);
            setPaymentAmount('');
            fetchData();
        } catch (err) { alert('خطأ في تسجيل الدفعة'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/peer-debts', form);
            setForm({ personName: '', amount: '', dueDate: '', note: '', type: 'borrowed' });
            fetchData();
        } catch (err) { alert('خطأ في الحفظ'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/peer-debts/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة الالتزامات (مبالغ عليّ للآخرين)</h1>

            {/* Liability Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-900/20">
                    <p className="text-red-100 text-xs mb-1">إجمالي المديونية المتبقية للغير</p>
                    <p className="text-3xl font-black">{stats?.totalBorrowedRemaining.toLocaleString()} ج.م</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs mb-1">ديون متأخرة أو وشيكة</p>
                        <p className="text-2xl font-black text-blue-500">{debts.filter(d => !d.isPaid && new Date(d.dueDate) < new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)).length} حالة</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                        <AlertTriangle />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entry Form */}
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl h-fit">
                    <h3 className="text-xl font-bold text-white mb-6">تسجيل سلفة / دين جديد</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم الدائن" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.personName} onChange={e => setForm({...form, personName: e.target.value})} required />
                        <input type="number" placeholder="أصل الدين" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                        <button type="submit" className="w-full py-4 bg-red-600 rounded-xl font-black text-white shadow-lg shadow-red-900/20">حفظ الالتزام</button>
                    </form>
                </div>

                {/* Ledger Cards - FIXING ACTIONS FOR MOBILE */}
                <div className="lg:col-span-2 space-y-6">
                    {debts.map((debt) => (
                        <div key={debt._id} className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${debt.isPaid ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
                            {(!debt.isPaid && new Date(debt.dueDate) < new Date()) && (
                                <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-br-2xl">
                                    تجاوزت الموعد بـ {debt.analytics.delayDays} يوم
                                </div>
                            )}
                            
                            {/* Action Buttons: Always visible on Mobile, hover on Desktop */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                                <button onClick={() => handleDelete(debt._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${debt.isPaid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {debt.isPaid ? <CheckCircle2 size={28} /> : <Handshake size={28} />}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white">{debt.personName}</h4>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <Calendar size={12} /> موعد السداد: {new Date(debt.dueDate).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 flex-1 md:flex-none">
                                    <div className="text-center">
                                        <p className="text-[10px] text-slate-500 mb-1">أصل المديونية</p>
                                        <p className="font-bold text-white text-sm">{debt.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-blue-500 mb-1">ما سددته</p>
                                        <p className="font-bold text-blue-400 text-sm">{debt.analytics.paidAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-red-500 mb-1">المتبقي</p>
                                        <p className="font-black text-white text-sm">{debt.analytics.remainingAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                {!debt.isPaid && (
                                    <button 
                                        onClick={() => { setSelectedDebt(debt); setShowPaymentModal(true); }}
                                        className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                                    >
                                        <Receipt size={20} />
                                    </button>
                                )}
                            </div>
                            
                            {!debt.isPaid && (
                                <div className="mt-6 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(debt.analytics.paidAmount / debt.amount) * 100}%` }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Partial Payment */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl scale-in">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Receipt className="text-red-500" /> تسجيل دفعة سداد لـ {selectedDebt?.personName}
                        </h3>
                        <form onSubmit={handleRecordPayment} className="space-y-6 text-right">
                            <p className="text-xs text-slate-500">المبلغ المتبقي عليك: <span className="text-white font-bold">{selectedDebt?.analytics.remainingAmount.toLocaleString()} ج.م</span></p>
                            <input type="number" placeholder="ادخل المبلغ المدفوع" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-slate-500 font-bold">إلغاء</button>
                                <button type="submit" className="flex-1 py-4 bg-red-600 rounded-xl font-black text-white shadow-lg shadow-red-900/20">تأكيد السداد</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Borrowed;
