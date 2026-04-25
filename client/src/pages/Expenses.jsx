import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Calendar, Tag, CreditCard, Edit2, X } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('كاش');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/expenses/${editingId}`, { amount, note, paymentMethod });
                setEditingId(null);
            } else {
                await api.post('/expenses', { amount, note, paymentMethod });
            }
            setAmount('');
            setNote('');
            setPaymentMethod('كاش');
            fetchExpenses();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setAmount(item.amount);
        setNote(item.note);
        setPaymentMethod(item.paymentMethod);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة المصروفات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-3xl border shadow-xl h-fit sticky top-32 transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editingId ? <Edit2 className="text-indigo-400" /> : <Plus className="text-blue-500" />}
                            {editingId ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
                        </h3>
                        {editingId && (
                            <button onClick={() => {setEditingId(null); setAmount(''); setNote('');}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">المبلغ (ج.م)</label>
                            <input type="number" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">البيان</label>
                            <input type="text" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={note} onChange={(e) => setNote(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">طريقة الدفع</label>
                            <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="كاش">كاش</option>
                                <option value="فيزا">فيزا</option>
                                <option value="تحويل">تحويل</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'تسجيل المصروف')}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">قائمة المصروفات</h3>
                    <div className="space-y-4">
                        {expenses.length > 0 ? (
                            expenses.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center"><Tag size={20} /></div>
                                        <div>
                                            <div className="font-bold text-lg">{item.note}</div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span><Calendar size={14} className="inline ml-1" /> {new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                                <span><CreditCard size={14} className="inline ml-1" /> {item.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xl font-black text-white">{item.amount.toLocaleString()} ج.م</div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="text-slate-600 hover:text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (<div className="text-center py-20 text-slate-500">لا توجد مصروفات مسجلة.</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
