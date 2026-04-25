import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, TrendingUp, DollarSign, 
    Edit2, X, Wallet, Building2, Landmark, 
    RefreshCcw, ShieldCheck, Timer
} from 'lucide-react';

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
    const [stats, setStats] = useState(null);
    const [form, setForm] = useState({
        amount: '', source: '', incomeType: 'ثابت', cashFlowType: 'محصل', 
        isRecurring: false, recurringPeriod: 'لا يوجد', account: 'نقدي'
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchIncomes = async () => {
        try {
            const res = await api.get('/incomes');
            setIncomes(res.data.incomes);
            setStats(res.data.stats);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchIncomes(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/incomes/${editingId}`, form);
                setEditingId(null);
            } else {
                await api.post('/incomes', form);
            }
            setForm({ amount: '', source: '', incomeType: 'ثابت', cashFlowType: 'محصل', isRecurring: false, recurringPeriod: 'لا يوجد', account: 'نقدي' });
            fetchIncomes();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            amount: item.amount,
            source: item.source,
            incomeType: item.incomeType,
            cashFlowType: item.cashFlowType,
            isRecurring: item.isRecurring,
            recurringPeriod: item.recurringPeriod,
            account: item.account
        });
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
        <div className="space-y-8 fade-in text-right" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة التدفقات النقدية (المدخولات)</h1>

            {/* Accounting Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-900/20">
                    <div className="flex justify-between items-center mb-4">
                        <ShieldCheck size={24} />
                        <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest font-bold">محصل فعلي</span>
                    </div>
                    <p className="text-emerald-100 text-xs mb-1">دخل محصل هذا الشهر</p>
                    <p className="text-2xl font-black">{stats?.receivedThisMonth.toLocaleString()} ج.م</p>
                </div>

                <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-900/20">
                    <div className="flex justify-between items-center mb-4">
                        <Timer size={24} />
                        <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest font-bold">متوقع</span>
                    </div>
                    <p className="text-indigo-100 text-xs mb-1">دخل مستحق (متوقع)</p>
                    <p className="text-2xl font-black">{stats?.accruedThisMonth.toLocaleString()} ج.م</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <TrendingUp className="text-blue-500" size={24} />
                        <span className="text-[10px] text-slate-500 font-bold">استقرار الدخل</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-1">نسبة الدخل الثابت</p>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-black text-white">{stats?.fixedRatio}%</p>
                        <div className="flex-1 bg-slate-800 h-1.5 rounded-full mb-2">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stats?.fixedRatio}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Form */}
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        {editingId ? <Edit2 className="text-indigo-400" /> : <Plus className="text-emerald-500" />}
                        {editingId ? 'تعديل التدفق' : 'تسجيل دخل جديد'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        <input type="text" placeholder="مصدر الدخل (مثلاً: راتب، مشروع...)" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={form.source} onChange={e => setForm({...form, source: e.target.value})} required />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block mr-2">نوع الدخل</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.incomeType} onChange={e => setForm({...form, incomeType: e.target.value})}>
                                    <option value="ثابت">ثابت</option>
                                    <option value="متغير">متغير</option>
                                    <option value="موسمي">موسمي</option>
                                    <option value="استثنائي">استثنائي</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 mb-1 block mr-2">الحالة المالية</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.cashFlowType} onChange={e => setForm({...form, cashFlowType: e.target.value})}>
                                    <option value="محصل">محصل</option>
                                    <option value="مستحق">مستحق</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 mb-1 block mr-2">الحساب المستلم</label>
                            <select className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm" value={form.account} onChange={e => setForm({...form, account: e.target.value})}>
                                <option value="نقدي">نقدي (كاش)</option>
                                <option value="بنك">حساب بنكي</option>
                                <option value="محفظة">محفظة إلكترونية</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-2">
                            <input type="checkbox" checked={form.isRecurring} onChange={e => setForm({...form, isRecurring: e.target.checked})} className="w-4 h-4 rounded text-emerald-500" />
                            <span className="text-sm text-slate-300 font-bold">دخل متكرر دورياً</span>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full font-black py-4 rounded-xl shadow-lg transition-all ${editingId ? 'bg-indigo-600' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/40'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'تسجيل التدفق')}
                        </button>
                    </form>
                </div>

                {/* Analytical List */}
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">قائمة التدفقات النقدية</h3>
                    <div className="space-y-4">
                        {incomes.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.cashFlowType === 'محصل' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                        {item.account === 'بنك' ? <Landmark size={20} /> : item.account === 'محفظة' ? <Wallet size={20} /> : <DollarSign size={20} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-white flex items-center gap-2">
                                            {item.source}
                                            {item.isRecurring && <RefreshCcw size={12} className="text-blue-400" />}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                            <span className="bg-slate-800 px-2 py-0.5 rounded uppercase font-bold">{item.incomeType}</span>
                                            <span><Calendar size={12} className="inline ml-1" /> {new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-left">
                                        <div className={`text-xl font-black ${item.cashFlowType === 'محصل' ? 'text-emerald-400' : 'text-slate-500 italic'}`}>
                                            {item.cashFlowType === 'محصل' ? '+' : 'قيد الانتظار '}{item.amount.toLocaleString()} ج.م
                                        </div>
                                        <div className="text-[10px] text-slate-600 text-left">{item.account}</div>
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

export default Incomes;
