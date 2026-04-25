import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, Tag, 
    Wallet, ArrowDownCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2
} from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ amount: '', categoryId: '', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], note: '', necessityLevel: 'basic', budgetCategory: 'Food' });

    const fetchData = async () => {
        try {
            const [expRes, budRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/budgets')
            ]);
            setExpenses(expRes.data.expenses);
            setStats(expRes.data.stats);
            setBudgets(budRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', form);
            setForm({ amount: '', categoryId: '', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], note: '', necessityLevel: 'basic', budgetCategory: 'Food' });
            fetchData();
        } catch (err) { alert('خطأ في الحفظ'); }
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
            <h1 className="text-3xl font-black text-white">إدارة المصاريف والميزانية</h1>

            {/* Budget Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Food', 'Transport', 'Bills', 'Shopping'].map(cat => {
                    const budget = budgets.find(b => b.category === cat);
                    const spent = expenses.filter(e => e.budgetCategory === cat).reduce((s, e) => s + e.amount, 0);
                    const limit = budget ? budget.limit : 1000;
                    const percent = Math.min((spent / limit) * 100, 100);
                    
                    return (
                        <div key={cat} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase">{cat === 'Food' ? 'طعام' : cat === 'Transport' ? 'مواصلات' : cat === 'Bills' ? 'فواتير' : 'تسوق'}</span>
                                <span className={`text-[10px] font-bold ${percent > 90 ? 'text-red-500' : 'text-blue-500'}`}>{Math.round(percent)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                <div className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 font-bold">{spent.toLocaleString()} / {limit.toLocaleString()} <span className="text-[8px] opacity-50">ج.م</span></p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-fit sticky top-24">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="text-blue-500" /> إضافة مصروف جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.budgetCategory} onChange={e => setForm({...form, budgetCategory: e.target.value})}>
                            <option value="Food">طعام وشراب</option>
                            <option value="Transport">مواصلات</option>
                            <option value="Bills">فواتير والتزامات</option>
                            <option value="Shopping">تسوق وترفيه</option>
                        </select>
                        <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.necessityLevel} onChange={e => setForm({...form, necessityLevel: e.target.value})}>
                            <option value="basic">أساسي (لا يمكن الاستغناء عنه)</option>
                            <option value="luxury">كمالي (رفاهية)</option>
                        </select>
                        <input type="text" placeholder="بيان / ملاحظة" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        <button type="submit" className="w-full py-4 bg-blue-600 rounded-2xl font-black text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all">حفظ العملية</button>
                    </form>
                </div>

                {/* List Section - FIXING ACTIONS FOR MOBILE */}
                <div className="lg:col-span-2 space-y-4">
                    {expenses.map((exp) => (
                        <div key={exp._id} className="group relative bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all shadow-xl">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${exp.necessityLevel === 'luxury' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {exp.necessityLevel === 'luxury' ? <Tag size={20} /> : <Receipt size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg">{exp.amount.toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                                        <p className="text-slate-500 text-xs mt-1">{exp.note || 'مصروف عام'} • {new Date(exp.date).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                                
                                {/* ACTIONS: Always visible on Mobile, hover on Desktop */}
                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                    <button className="p-2 text-slate-500 hover:text-blue-500 transition-colors">
                                        <Edit2 size={18} />
                                    </button>
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
