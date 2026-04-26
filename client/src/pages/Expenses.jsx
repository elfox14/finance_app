import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, TrendingDown, 
    Wallet, ArrowDownCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2
} from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ amount: '', category: 'عام', date: new Date().toISOString().split('T')[0], note: '', account: 'cash' });

    const fetchData = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(Array.isArray(res.data.expenses) ? res.data.expenses : []);
            setStats(res.data.stats);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...form, amount: Number(form.amount) };
            const res = await api.post('/expenses', dataToSend);
            if (res.status === 201 || res.status === 200) {
                setForm({ amount: '', category: 'عام', date: new Date().toISOString().split('T')[0], note: '', account: 'cash' });
                fetchData();
                alert('تم حفظ المصروف بنجاح');
            }
        } catch (err) { 
            console.error('Save Error:', err);
            alert('خطأ في الحفظ: ' + (err.response?.data?.message || err.message)); 
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <h1 className="text-3xl font-black text-white">إدارة المصروفات</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-900/20">
                    <p className="text-red-100 text-xs mb-1 font-bold">إجمالي المصاريف (هذا الشهر)</p>
                    <p className="text-4xl font-black">{stats?.totalAmount?.toLocaleString() || 0} <span className="text-sm font-normal">ج.م</span></p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                    <p className="text-slate-500 text-xs mb-1 font-bold">أكبر فئة صرف</p>
                    <p className="text-4xl font-black text-white">{stats?.topCategory || 'لا يوجد'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-fit">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Plus className="text-red-500" /> إضافة مصروف</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-red-500 transition-all" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                            <option value="عام">عام</option>
                            <option value="طعام">طعام وشراب</option>
                            <option value="مواصلات">مواصلات</option>
                            <option value="سكن">سكن وفواتير</option>
                            <option value="ترفيه">ترفيه</option>
                            <option value="صحة">صحة وأدوية</option>
                        </select>
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        <button type="submit" className="w-full py-4 bg-red-600 rounded-2xl font-black text-white shadow-lg hover:bg-red-700 transition-all">حفظ المصروف</button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {(Array.isArray(expenses) ? expenses : []).map((exp) => (
                        <div key={exp._id} className="group relative bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-red-500/30 transition-all shadow-xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                        <ArrowDownCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg">{exp.amount?.toLocaleString() || 0} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                                        <p className="text-slate-500 text-xs mt-1">{exp.category} • {new Date(exp.date).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleDelete(exp._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
