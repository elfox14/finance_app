import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Target, AlertTriangle, CheckCircle2,
    TrendingUp, ArrowRight, ArrowLeft, RefreshCw, Plus, Edit2, Trash2, PieChart, Info
} from 'lucide-react';

const CATEGORIES = ['طعام', 'مواصلات', 'فواتير', 'تسوق', 'صحة', 'تعليم', 'ترفيه', 'صيانة', 'أخرى'];

const Budgets = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    
    const [budgets, setBudgets] = useState([]);
    const [kpis, setKpis] = useState({ totalBudget: 0, totalActual: 0, totalRemaining: 0, exceededCount: 0, overallSpent: 0, unbudgetedSpent: 0 });
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ category: CATEGORIES[0], plannedAmount: '', status: 'approved' });

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/budgets?month=${month}&year=${year}`);
            setBudgets(res.data.budgets || []);
            setKpis(res.data.kpis || {});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBudgets(); }, [month, year]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets', { ...form, month, year });
            setShowModal(false);
            setForm({ category: CATEGORIES[0], plannedAmount: '', status: 'approved' });
            fetchBudgets();
        } catch (err) { alert('خطأ في حفظ الموازنة'); }
    };

    const handleDuplicate = async () => {
        if (!window.confirm('هل أنت متأكد من نسخ موازنة الشهر السابق لتكون مسودة هذا الشهر؟')) return;
        try {
            await api.post('/budgets/duplicate', { targetMonth: month, targetYear: year });
            fetchBudgets();
        } catch (err) { alert(err.response?.data?.message || 'خطأ في النسخ'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الموازنة؟')) return;
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    const changeMonth = (offset) => {
        let newMonth = month + offset;
        let newYear = year;
        if (newMonth > 12) { newMonth = 1; newYear += 1; }
        else if (newMonth < 1) { newMonth = 12; newYear -= 1; }
        setMonth(newMonth);
        setYear(newYear);
    };

    return (
        <div className="space-y-8 fade-in text-right pb-24 md:pb-10" dir="rtl">
            {/* ===== Header & Time Navigation ===== */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3">
                        <Target className="text-blue-500" size={32} /> تخطيط الموازنات
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">قارن الإنفاق المخطط بالإنفاق الفعلي (Budget vs Actual)</p>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <button onClick={() => changeMonth(1)} className="p-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-blue-600/20">
                        <ArrowRight size={20} />
                    </button>
                    <div className="text-center min-w-[120px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">فترة الموازنة</p>
                        <p className="text-xl font-black text-white">{month} / {year}</p>
                    </div>
                    <button onClick={() => changeMonth(-1)} className="p-3 bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all hover:bg-blue-600/20">
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleDuplicate} className="p-4 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2" title="نسخ موازنة الشهر السابق">
                        <RefreshCw size={20} />
                    </button>
                    <button onClick={() => { setForm({ category: CATEGORIES[0], plannedAmount: '', status: 'approved' }); setShowModal(true); }} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-900/30 hover:scale-105 transition-all flex items-center gap-2">
                        <Plus size={20} /> اعتماد موازنة للفئة
                    </button>
                </div>
            </header>

            {/* ===== KPIs Dashboard ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-center transition-all hover:border-blue-500/30">
                    <p className="text-[10px] text-blue-500 font-bold uppercase mb-2">إجمالي الموازنة المعتمدة</p>
                    <p className="text-3xl font-black text-white">{kpis.totalBudget?.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-center transition-all hover:border-slate-500/30">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">إجمالي الإنفاق الفعلي (لكل الفئات)</p>
                    <p className="text-3xl font-black text-slate-300">{kpis.overallSpent?.toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                </div>
                <div className={`p-6 rounded-3xl shadow-xl flex flex-col justify-center transition-all border ${kpis.totalRemaining < 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
                    <p className={`text-[10px] font-bold uppercase mb-2 ${kpis.totalRemaining < 0 ? 'text-red-400' : 'text-emerald-500'}`}>الانحراف العام (المتبقي من الموازنة)</p>
                    <p className={`text-3xl font-black ${kpis.totalRemaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {Math.abs(kpis.totalRemaining || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span>
                        {kpis.totalRemaining < 0 && <span className="text-xs mr-2 font-bold">(عجز)</span>}
                    </p>
                </div>
                <div className="bg-orange-900/10 border border-orange-500/20 p-6 rounded-3xl shadow-xl flex flex-col justify-center transition-all">
                    <p className="text-[10px] text-orange-400 font-bold uppercase mb-2">تجاوزات الفئات</p>
                    <p className="text-3xl font-black text-orange-400">{kpis.exceededCount} <span className="text-sm opacity-50">فئة</span></p>
                </div>
            </div>

            {/* Unbudgeted Spent Alert */}
            {kpis.unbudgetedSpent > 0 && (
                <div className="mx-4 md:mx-0 p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-slate-700 rounded-xl text-slate-400"><Info size={20} /></div>
                    <div>
                        <p className="text-sm font-bold text-white">توجد مصروفات خارج الموازنة بقيمة {kpis.unbudgetedSpent.toLocaleString()} ج.م</p>
                        <p className="text-xs text-slate-400">هذه مصروفات مسجلة في الدفتر لكن ليس لها موازنة معتمدة هذا الشهر.</p>
                    </div>
                </div>
            )}

            {/* ===== Budget vs Actual Table ===== */}
            {loading ? (
                <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div></div>
            ) : budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-[3rem] mx-4 md:mx-0">
                    <Target size={64} className="text-slate-700 mb-4" />
                    <p className="text-white font-black text-xl mb-2">لا توجد موازنات معتمدة لهذا الشهر</p>
                    <p className="text-slate-500 text-sm">قم بنسخ موازنة الشهر الماضي أو إدخال الموازنات الجديدة يدوياً.</p>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden mx-4 md:mx-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-950 text-slate-500 text-xs border-b border-slate-800">
                                <tr>
                                    <th className="p-6 font-black uppercase tracking-widest">الفئة (النشاط)</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-blue-400">Budget (المخطط)</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-emerald-400">Actual (الفعلي)</th>
                                    <th className="p-6 font-black uppercase tracking-widest">Variance (الانحراف)</th>
                                    <th className="p-6 font-black uppercase tracking-widest">المؤشر</th>
                                    <th className="p-6 font-black uppercase tracking-widest text-center">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgets.map((b) => (
                                    <tr key={b._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${b.trafficLight === 'red' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : b.trafficLight === 'yellow' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
                                                <div>
                                                    <p className="font-black text-white text-base">{b.category}</p>
                                                    {b.status === 'draft' && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-bold">مسودة</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-black text-white text-lg">{(b.plannedAmount || b.limit || 0).toLocaleString()} <span className="text-[10px] opacity-40">ج.م</span></td>
                                        <td className="p-6 font-black text-emerald-400 text-lg">{b.spent.toLocaleString()} <span className="text-[10px] opacity-40">ج.م</span></td>
                                        <td className="p-6">
                                            <p className={`font-black text-lg flex items-center gap-1 ${b.variance < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                                {Math.abs(b.variance).toLocaleString()} <span className="text-[10px] opacity-40">ج.م</span>
                                                {b.variance < 0 ? <TrendingUp size={14} className="text-red-500" title="تجاوز الميزانية" /> : <TrendingDown size={14} className="text-emerald-500" title="وفر في الميزانية" />}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${b.trafficLight === 'red' ? 'bg-red-500' : b.trafficLight === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${Math.min(b.variancePercent, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-black w-10 text-left ${b.trafficLight === 'red' ? 'text-red-500' : 'text-slate-400'}`}>{b.variancePercent}%</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setForm({ category: b.category, plannedAmount: b.plannedAmount || b.limit, status: b.status, notes: b.notes }); setShowModal(true); }} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"><Edit2 size={14}/></button>
                                                <button onClick={() => handleDelete(b._id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-800 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Over-budget Categories Widget */}
            {budgets.filter(b => b.trafficLight === 'red').length > 0 && (
                <div className="mx-4 md:mx-0 p-8 bg-red-950/20 border border-red-500/20 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-lg font-black text-red-400 flex items-center gap-2 mb-6">
                        <AlertTriangle size={20} /> فئات حرجة (تجاوزت الموازنة)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {budgets.filter(b => b.trafficLight === 'red').map(b => (
                            <div key={b._id} className="p-5 bg-slate-900 border border-red-500/30 rounded-2xl">
                                <p className="text-sm font-bold text-white mb-2">{b.category}</p>
                                <p className="text-xl font-black text-red-400">{b.variancePercent}% <span className="text-[10px] text-slate-500 font-bold ml-1">استهلاك</span></p>
                                <p className="text-[10px] text-red-500/70 mt-1">عجز: {Math.abs(b.variance).toLocaleString()} ج.م</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== Modal ===== */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
                        <button onClick={() => setShowModal(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3">
                            <PieChart className="text-blue-500" /> اعتماد موازنة
                        </h2>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">الفئة المستهدفة</label>
                                <select required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500 appearance-none"
                                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">المبلغ المخطط (المعتمد)</label>
                                <input type="number" required placeholder="0.00" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-2xl text-center outline-none focus:border-blue-500 transition-all"
                                    value={form.plannedAmount} onChange={e => setForm({ ...form, plannedAmount: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">حالة الموازنة</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setForm({...form, status: 'approved'})} className={`py-4 rounded-xl font-bold text-sm transition-all ${form.status === 'approved' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>معتمدة (نهائية)</button>
                                    <button type="button" onClick={() => setForm({...form, status: 'draft'})} className={`py-4 rounded-xl font-bold text-sm transition-all ${form.status === 'draft' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-500'}`}>مسودة (مبدئية)</button>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/20 transition-all mt-4">
                                حفظ التخطيط المالي
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
