import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Calendar, TrendingUp, 
    Wallet, ArrowUpCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2,
    Activity, ShieldCheck, Zap
} from 'lucide-react';

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ 
        amount: '', 
        source: '', 
        date: new Date().toISOString().split('T')[0], 
        note: '', 
        incomeType: 'fixed', // ثابت أو متغير
        cashFlowType: 'received', // محصل أو متوقع
        account: 'cash' 
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/incomes');
            setIncomes(Array.isArray(res.data.incomes) ? res.data.incomes : []);
            setStats(res.data.stats);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/incomes', form);
            setForm({ amount: '', source: '', date: new Date().toISOString().split('T')[0], note: '', incomeType: 'fixed', cashFlowType: 'received', account: 'cash' });
            fetchData();
        } catch (err) { alert('خطأ في الحفظ'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/incomes/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-24 lg:pb-10" dir="rtl">
            <header className="px-4 md:px-0">
                <h1 className="text-3xl font-black text-white italic">إدارة التدفقات الداخلة</h1>
                <p className="text-slate-500 text-sm mt-1">تتبع الدخل الثابت والمتغير والمستحقات القادمة</p>
            </header>

            {/* إحصائيات الربط المحاسبي */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full transition-transform group-hover:scale-150"></div>
                    <p className="text-emerald-100 text-[10px] mb-1 font-black uppercase tracking-widest">إجمالي المحصل فعلياً</p>
                    <p className="text-4xl font-black italic">{stats?.totalReceived?.toLocaleString() || 0} <span className="text-sm font-normal not-italic opacity-70">ج.م</span></p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full transition-transform group-hover:scale-150"></div>
                    <p className="text-slate-500 text-[10px] mb-1 font-black uppercase tracking-widest">إجمالي المستحقات (المتوقع)</p>
                    <p className="text-4xl font-black text-white italic">{stats?.totalExpected?.toLocaleString() || 0} <span className="text-sm font-normal not-italic opacity-40">ج.م</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* نموذج الإدخال المحاسبي */}
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl h-fit">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-2"><Plus className="text-emerald-500" /> تسجيل دخل</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase mr-2">المبلغ</label>
                            <input type="number" placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all font-mono text-xl" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase mr-2">المصدر</label>
                            <input type="text" placeholder="مثلاً: الراتب، بيع أصول..." className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl outline-none" value={form.source} onChange={e => setForm({...form, source: e.target.value})} required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase mr-2">نوع الدخل</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none text-xs font-bold" value={form.incomeType} onChange={e => setForm({...form, incomeType: e.target.value})}>
                                    <option value="fixed">ثابت (راتب)</option>
                                    <option value="variable">متغير (عمل حر)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase mr-2">الحالة</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none text-xs font-bold" value={form.cashFlowType} onChange={e => setForm({...form, cashFlowType: e.target.value})}>
                                    <option value="received">تم الاستلام</option>
                                    <option value="accrued">متوقع (دين)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase mr-2">التاريخ</label>
                            <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-white shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all">تأكيد الإدخال المحاسبي</button>
                    </form>
                </div>

                {/* قائمة التدفقات */}
                <div className="lg:col-span-2 space-y-4">
                    {(Array.isArray(incomes) ? incomes : []).map((inc) => (
                        <div key={inc._id} className="group relative bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] hover:border-emerald-500/30 transition-all shadow-xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${inc.cashFlowType === 'accrued' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {inc.incomeType === 'fixed' ? <ShieldCheck size={24} /> : <Zap size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-white text-xl italic">{inc.amount?.toLocaleString() || 0} <span className="text-xs font-normal not-italic opacity-40">ج.م</span></p>
                                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${inc.incomeType === 'fixed' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                {inc.incomeType === 'fixed' ? 'ثابت' : 'متغير'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-xs font-bold">{inc.source} • {new Date(inc.date).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`text-center px-4 py-2 rounded-xl border ${inc.cashFlowType === 'accrued' ? 'border-orange-500/20 text-orange-500 bg-orange-500/5' : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'}`}>
                                        <p className="text-[8px] font-black uppercase mb-1">الحالة</p>
                                        <p className="text-[10px] font-bold">{inc.cashFlowType === 'accrued' ? 'متوقع' : 'مُحصل'}</p>
                                    </div>
                                    <button onClick={() => handleDelete(inc._id)} className="p-3 text-slate-700 hover:text-red-500 transition-colors bg-slate-800/50 rounded-xl">
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

export default Incomes;
