import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, Tag, CreditCard, 
    Edit2, X, AlertCircle, ShoppingBag, Utensils, 
    Bus, Receipt, Coffee, MoreHorizontal
} from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [form, setForm] = useState({
        amount: '', note: '', expenseType: 'متغير', necessityLevel: 'أساسي', 
        budgetCategory: 'طعام', paymentSource: 'كاش', vendor: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data.expenses);
            setAnalytics(res.data.analytics);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchExpenses(); }, []);

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
            fetchExpenses();
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
            fetchExpenses();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    const getCategoryIcon = (cat) => {
        switch(cat) {
            case 'طعام': return <Utensils size={18} />;
            case 'مواصلات': return <Bus size={18} />;
            case 'فواتير': return <Receipt size={18} />;
            case 'تسوق': return <ShoppingBag size={18} />;
            case 'ترفيه': return <Coffee size={18} />;
            default: return <Tag size={18} />;
        }
    };

    return (
        <div className="space-y-8 fade-in text-right" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة الرقابة المالية (المصروفات)</h1>

            {/* Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-600 p-6 rounded-[2rem] text-white shadow-xl shadow-red-900/20">
                    <div className="flex justify-between items-center mb-4">
                        <AlertCircle size={24} />
                        <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold uppercase">استنزاف</span>
                    </div>
                    <p className="text-red-100 text-xs mb-1">أعلى فئة إنفاق</p>
                    <p className="text-2xl font-black">{analytics?.topCategory}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <CreditCard className="text-blue-500" size={24} />
                        <span className="text-[10px] text-slate-500 font-bold">الميزانية</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">إجمالي إنفاق الشهر</p>
                    <p className="text-2xl font-black text-white">{analytics?.totalSpentThisMonth.toLocaleString()} ج.م</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                    <div className="flex justify-between items-center mb-4 text-orange-500">
                        <MoreHorizontal size={24} />
                        <span className="text-[10px] text-slate-500 font-bold">جودة الإنفاق</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">نسبة الكماليات</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-white">{analytics?.basicVsLuxury.ratio}%</p>
                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full mb-2 overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: `${analytics?.basicVsLuxury.ratio}%` }}></div>
                        </div>
                    </div>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block mr-2">النوع</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.expenseType} onChange={e => setForm({...form, expenseType: e.target.value})}>
                                    <option value="ثابت">ثابت</option>
                                    <option value="متغير">متغير</option>
                                    <option value="طارئ">طارئ</option>
                                    <option value="موسمي">موسمي</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block mr-2">المصدر</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.paymentSource} onChange={e => setForm({...form, paymentSource: e.target.value})}>
                                    <option value="كاش">كاش</option>
                                    <option value="بنك">بنك</option>
                                    <option value="بطاقة">بطاقة ائتمان</option>
                                    <option value="محفظة">محفظة</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full font-black py-4 rounded-xl transition-all ${editingId ? 'bg-indigo-600' : 'bg-red-600 hover:bg-red-700'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'تسجيل المصروف')}
                        </button>
                    </form>
                </div>

                {/* List View */}
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">سجل المصروفات التحليلي</h3>
                    <div className="space-y-4">
                        {expenses.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                        {getCategoryIcon(item.budgetCategory)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-white">{item.note}</div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold">{item.budgetCategory}</span>
                                            <span className={`px-2 py-0.5 rounded font-bold ${item.necessityLevel === 'كمالي' ? 'text-orange-400 border border-orange-500/20' : 'text-slate-500'}`}>
                                                {item.necessityLevel}
                                            </span>
                                            <span><Calendar size={12} className="inline ml-1" /> {new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-left">
                                        <div className="text-xl font-black text-white">{item.amount.toLocaleString()} ج.م</div>
                                        <div className="text-[10px] text-slate-600">{item.paymentSource}</div>
                                    </div>
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
