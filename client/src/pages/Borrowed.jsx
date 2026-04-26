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
            const allDebts = Array.isArray(res.data.debts) ? res.data.debts : [];
            setDebts(allDebts.filter(d => d.type === 'borrowed'));
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
            <h1 className="text-3xl font-bold text-white">إدارة الديون المستحقة</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-900/20">
                    <p className="text-red-100 text-xs mb-1 font-bold">إجمالي المديونية الحالية</p>
                    <p className="text-3xl font-black">{stats?.totalBorrowedRemaining?.toLocaleString() || 0} ج.م</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl h-fit">
                    <h3 className="text-xl font-bold text-white mb-6">تسجيل مديونية جديدة</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم الدائن" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.personName} onChange={e => setForm({...form, personName: e.target.value})} required />
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <button type="submit" className="w-full py-4 bg-red-600 rounded-xl font-black text-white shadow-lg">حفظ المديونية</button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {(Array.isArray(debts) ? debts : []).map((debt) => {
                        const analytics = debt.analytics || {};
                        return (
                            <div key={debt._id} className={`group p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${debt.isPaid ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
                                <div className="absolute top-6 left-6 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                                    <button onClick={() => handleDelete(debt._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${debt.isPaid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {debt.isPaid ? <CheckCircle2 size={28} /> : <User size={28} />}
                                        </div>
                                        <h4 className="text-xl font-black text-white">{debt.personName}</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 flex-1 md:flex-none text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-500 mb-1 font-bold">إجمالي الدين</p>
                                            <p className="font-bold text-white text-sm">{debt.amount?.toLocaleString() || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-500 mb-1 font-bold">المسدد</p>
                                            <p className="font-bold text-emerald-400 text-sm">{analytics.paidAmount?.toLocaleString() || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-red-500 mb-1 font-bold">المتبقي</p>
                                            <p className="font-black text-white text-sm">{analytics.remainingAmount?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>
                                    {!debt.isPaid && (
                                        <button onClick={() => { setSelectedDebt(debt); setShowPaymentModal(true); }} className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg">
                                            <Receipt size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Borrowed;
