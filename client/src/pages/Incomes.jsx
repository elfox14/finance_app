import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, Calendar, TrendingUp, DollarSign, Edit2, X } from 'lucide-react';

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchIncomes = async () => {
        try {
            const res = await api.get('/incomes');
            setIncomes(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchIncomes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/incomes/${editingId}`, { amount, source });
                setEditingId(null);
            } else {
                await api.post('/incomes', { amount, source });
            }
            setAmount('');
            setSource('');
            fetchIncomes();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setAmount(item.amount);
        setSource(item.source);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/incomes/${id}`);
            fetchIncomes();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة المدخولات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editingId ? <Edit2 className="text-emerald-400" /> : <Plus className="text-emerald-500" />}
                            {editingId ? 'تعديل الدخل' : 'إضافة دخل جديد'}
                        </h3>
                        {editingId && (
                            <button onClick={() => {setEditingId(null); setAmount(''); setSource('');}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <input type="text" placeholder="المصدر" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={source} onChange={e => setSource(e.target.value)} required />
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl shadow-lg ${editingId ? 'bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'تسجيل الدخل')}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">قائمة المداخيل</h3>
                    <div className="space-y-4">
                        {incomes.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center"><TrendingUp size={20} /></div>
                                    <div>
                                        <div className="font-bold text-lg">{item.source}</div>
                                        <div className="text-sm text-slate-500"><Calendar size={14} className="inline ml-1" /> {new Date(item.date).toLocaleDateString('ar-EG')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xl font-black text-emerald-400">+{item.amount.toLocaleString()} ج.م</div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(item._id)} className="text-slate-600 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Incomes;
