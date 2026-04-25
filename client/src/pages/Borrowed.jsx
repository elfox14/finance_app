import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';

const Borrowed = () => {
    const [debts, setDebts] = useState([]);
    const [form, setForm] = useState({ personName: '', amount: '', dueDate: '', note: '' });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchDebts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/peer-debts`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setDebts(res.data.filter(d => d.type === 'borrowed'));
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchDebts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/peer-debts`, 
                { ...form, type: 'borrowed' },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setForm({ personName: '', amount: '', dueDate: '', note: '' });
            fetchDebts();
        } catch (err) { alert('خطأ في الإضافة'); }
        finally { setLoading(false); }
    };

    const toggleStatus = async (id) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/peer-debts/${id}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchDebts();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!confirm('حذف؟')) return;
        await axios.delete(`${import.meta.env.VITE_API_URL}/peer-debts/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchDebts();
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">السلف (مبالغ عليّ)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-red-500" /> إضافة سلفة</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم الشخص" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.personName} onChange={e => setForm({...form, personName: e.target.value})} required />
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                        <textarea placeholder="ملاحظات" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none h-24" value={form.note} onChange={e => setForm({...form, note: e.target.value})}></textarea>
                        <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg">{loading ? 'جاري الحفظ...' : 'حفظ السلفة'}</button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {debts.length > 0 ? (
                        debts.map(debt => (
                            <div key={debt._id} className={`p-6 rounded-3xl border transition-all flex justify-between items-center ${debt.status === 'مسدد' ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-900 border-red-500/20 shadow-xl'}`}>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${debt.status === 'مسدد' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {debt.status === 'مسدد' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{debt.personName}</h4>
                                        <p className="text-slate-500 text-sm flex items-center gap-2"><User size={14} /> مبلغ: {debt.amount} ج.م</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => toggleStatus(debt._id)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${debt.status === 'مسدد' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white shadow-lg'}`}>
                                        {debt.status === 'نشط' ? 'تم السداد' : 'إعادة تنشيط'}
                                    </button>
                                    <button onClick={() => handleDelete(debt._id)} className="text-slate-600 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-500 italic">لا توجد سلف مسجلة.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Borrowed;
