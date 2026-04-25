import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, Tag, CreditCard, 
    Edit2, X, AlertCircle, ShoppingBag, Utensils, 
    Bus, Receipt, Coffee, Target, Save
} from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [form, setForm] = useState({
        amount: '', note: '', expenseType: 'متغير', necessityLevel: 'أساسي', 
        budgetCategory: 'طعام', paymentSource: 'كاش', vendor: ''
    });
    const [budgetLimit, setBudgetLimit] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            const [expRes, budRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/budgets')
            ]);
            setExpenses(expRes.data.expenses);
            setAnalytics(expRes.data.analytics);
            setBudgets(budRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSetBudget = async (category) => {
        if (!budgetLimit) return;
        try {
            await api.post('/budgets', { category, limit: budgetLimit });
            setBudgetLimit('');
            fetchData();
        } catch (err) { alert('خطأ في تعيين الميزانية'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/expenses/${editingId}`, form);
                setEditingId(null);
            } else {
                await api.post('/expenses', form);
            }
            setForm({ amount: '', note: '', expenseType: 'متغير', necessityLevel: 'أساسي', budgetCategory: 'طعام', paymentSource: 'كاش', vendor: '' });
            fetchData();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            amount: item.amount,
            note: item.note,
            expenseType: item.expenseType,
            necessityLevel: item.necessityLevel,
            budgetCategory: item.budgetCategory,
            paymentSource: item.paymentSource,
            vendor: item.vendor || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <h1 className="text-3xl font-bold text-white">الرقابة المالية والموازنة</h1>

            {/* Budget Monitoring Layer */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Target className="text-blue-500" /> مراقبة الميزانيات الشهرية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['طعام', 'مواصلات', 'فواتير', 'تسوق'].map(cat => {
                        const b = budgets.find(x => x.category === cat);
                        const isExceeded = b?.percent > 100;
                        return (
                            <div key={cat} className="p-5 bg-slate-800/40 rounded-3xl border border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-bold text-white">{cat}</span>
                                    {b ? (
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${isExceeded ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                            {b.percent}%
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input type="number" placeholder="الميزانية" className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-[10px]" onChange={e => setBudgetLimit(e.target.value)} />
                                            <button onClick={() => handleSetBudget(cat)} className="text-blue-500"><Plus size={14}/></button>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${isExceeded ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(b?.percent || 0, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[10px]">
                                    <span className="text-slate-500">من {b?.limit.toLocaleString() || 0}</span>
                                    <span className={isExceeded ? 'text-red-400 font-bold' : 'text-slate-400'}>{b ? (isExceeded ? 'تجاوزت!' : `متبقي ${b.remaining.toLocaleString()}`) : 'لم تحدد'}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Form */}
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <h3 className="text-xl font-bold text-white mb-6">
                        {editingId ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <input type="text" placeholder="البيان (ماذا اشتريت؟)" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.note} onChange={e => setForm({...form, note: e.target.value})} required />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block mr-2">الفئة</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.budgetCategory} onChange={e => setForm({...form, budgetCategory: e.target.value})}>
                                    <option value="طعام">طعام</option>
                                    <option value="مواصلات">مواصلات</option>
                                    <option value="فواتير">فواتير</option>
                                    <option value="تسوق">تسوق</option>
                                    <option value="صحة">صحة</option>
                                    <option value="ترفيه">ترفيه</option>
                                    <option value="أخرى">أخرى</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block mr-2">مستوى الضرورة</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.necessityLevel} onChange={e => setForm({...form, necessityLevel: e.target.value})}>
                                    <option value="أساسي">أساسي</option>
                                    <option value="مهم">مهم</option>
                                    <option value="كمالي">كمالي</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full font-black py-4 rounded-xl shadow-lg ${editingId ? 'bg-indigo-600' : 'bg-red-600 hover:bg-red-700 shadow-red-900/40'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'تسجيل المصروف')}
                        </button>
                    </form>
                </div>

                {/* List View */}
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">سجل المصروفات والميزانية</h3>
                    <div className="space-y-4">
                        {expenses.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-white">{item.note}</div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold">{item.budgetCategory}</span>
                                            <span><Calendar size={12} className="inline ml-1" /> {new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-left font-black text-white">{item.amount.toLocaleString()} ج.م</div>
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

export default Expenses;
