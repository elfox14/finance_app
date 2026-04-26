import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Search, Filter, 
    TrendingUp, Clock, AlertCircle, 
    ArrowUpRight, ShoppingBag, Coffee,
    Car, Home, CreditCard, Wallet,
    CheckCircle2, Sparkles, Calendar,
    BarChart3, LayoutGrid, List,
    ChevronDown, Info
} from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const [formData, setFormData] = useState({
        amount: '',
        note: '',
        budgetCategory: 'عام',
        necessityLevel: 'أساسي',
        expenseType: 'متغير',
        paymentSource: 'كاش',
        vendor: '',
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['طعام', 'مواصلات', 'فواتير', 'تسوق', 'صحة', 'تعليم', 'ترفيه', 'سكن', 'عام', 'أخرى'];
    const paymentSources = ['كاش', 'بنك', 'بطاقة', 'محفظة'];
    const necessityLevels = ['أساسي', 'مهم', 'كمالي'];
    const expenseTypes = ['ثابت', 'متغير', 'طارئ', 'موسمي'];

    const fetchData = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data.expenses);
            setStats(res.data.stats);
        } catch (err) {
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/expenses', formData);
            
            // Smart Feedback Logic
            const categoryBudget = stats?.budgetStatus?.find(b => b.category === formData.budgetCategory);
            let feedbackMsg = `تم إضافة ${formData.amount} ج.م بنجاح.`;
            if (categoryBudget) {
                const newPercent = (((categoryBudget.actual + Number(formData.amount)) / categoryBudget.limit) * 100).toFixed(0);
                feedbackMsg = `بند ${formData.budgetCategory} وصل الآن إلى ${newPercent}% من الميزانية.`;
            }
            if (formData.necessityLevel === 'كمالي') feedbackMsg += " (مصروف كمالي)";

            setFeedback(feedbackMsg);
            setTimeout(() => setFeedback(null), 5000);

            setFormData({
                amount: '',
                note: '',
                budgetCategory: 'عام',
                necessityLevel: 'أساسي',
                expenseType: 'متغير',
                paymentSource: 'كاش',
                vendor: '',
                date: new Date().toISOString().split('T')[0]
            });
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert('فشل في إضافة المصروف');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/expenses/${id}`);
            fetchData();
        } catch (err) {
            alert('فشل في الحذف');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20" dir="rtl">
            {/* 1) Control Bar - Stats Summary */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">مركز الرقابة المالية</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تتبع، حلل، وتحكم في إنفاقك اليومي</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:scale-105 transition-all"
                >
                    {showForm ? 'إلغاء' : <><Plus size={20} /> إضافة مصروف ذكي</>}
                </button>
            </header>

            {/* Smart Feedback Toast */}
            {feedback && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <Sparkles size={20} />
                    <span className="font-bold text-sm">{feedback}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 space-y-8">
                    {/* 2) Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ControlStat label="مصاريف الشهر" val={stats?.totalSpentThisMonth} color="blue" />
                        <ControlStat label="المتوسط اليومي" val={stats?.dailyAverage} color="indigo" />
                        <ControlStat label="أعلى فئة" val={stats?.topCategory} isText color="orange" />
                        <ControlStat label="نسبة الكماليات" val={`${stats?.basicVsLuxury?.ratio}%`} color="red" />
                    </div>

                    {/* 3) Budget Control Layer */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                            <BarChart3 className="text-blue-500" /> مراقبة الميزانيات (Budget Control)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stats?.budgetStatus?.length > 0 ? stats.budgetStatus.map((b, i) => (
                                <div key={i} className="bg-slate-800/30 p-5 rounded-3xl border border-slate-800">
                                    <div className="flex justify-between mb-3">
                                        <span className="font-bold text-white text-sm">{b.category}</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${b.status === 'over' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {b.percent}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
                                        <div className={`h-full transition-all duration-1000 ${b.status === 'over' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${b.percent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                        <span>المنفق: {b.actual?.toLocaleString()}</span>
                                        <span>المتبقي: {b.remaining?.toLocaleString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-slate-600 col-span-2 py-4 italic text-sm">لا توجد ميزانيات محددة لهذا الشهر. اذهب لقسم الميزانيات للبدء.</p>
                            )}
                        </div>
                    </div>

                    {/* 4) Smart Entry Form (Conditional) */}
                    {showForm && (
                        <div className="bg-slate-900 border-2 border-blue-600/30 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <Plus className="text-blue-500" /> تسجيل مصروف جديد
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">المبلغ (ج.م)</label>
                                    <input 
                                        type="number" required placeholder="0.00"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-blue-500 transition-all outline-none"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">البيان / الوصف</label>
                                    <input 
                                        type="text" required placeholder="ماذا اشتريت؟"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 transition-all outline-none"
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">الفئة الضريبية</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                        value={formData.budgetCategory}
                                        onChange={(e) => setFormData({...formData, budgetCategory: e.target.value})}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">مستوى الضرورة</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {necessityLevels.map(lvl => (
                                            <button 
                                                key={lvl} type="button"
                                                onClick={() => setFormData({...formData, necessityLevel: lvl})}
                                                className={`py-3 rounded-xl text-[10px] font-black transition-all ${formData.necessityLevel === lvl ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">مصدر الدفع</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {paymentSources.map(src => (
                                            <button 
                                                key={src} type="button"
                                                onClick={() => setFormData({...formData, paymentSource: src})}
                                                className={`py-3 rounded-xl text-[10px] font-black transition-all ${formData.paymentSource === src ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                                            >
                                                {src}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">اسم التاجر / المكان</label>
                                    <input 
                                        type="text" placeholder="اختياري"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                        value={formData.vendor}
                                        onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                                    />
                                </div>
                                <button type="submit" className="md:col-span-2 w-full bg-blue-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all mt-4">
                                    تأكيد وحفظ المصروف
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 5) History Ledger */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-black text-white flex items-center gap-3">
                                <List className="text-slate-500" /> سجل المصروفات
                            </h3>
                            <div className="flex gap-2">
                                <div className="p-2 bg-slate-800 rounded-xl text-slate-400"><Search size={18} /></div>
                                <div className="p-2 bg-slate-800 rounded-xl text-slate-400"><Filter size={18} /></div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {expenses.length > 0 ? expenses.map((exp) => (
                                <div key={exp._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-slate-800/20 transition-all gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            exp.necessityLevel === 'أساسي' ? 'bg-blue-500/10 text-blue-500' : 
                                            exp.necessityLevel === 'كمالي' ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'
                                        }`}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{exp.note || 'مصروف بدون بيان'}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">{exp.budgetCategory}</span>
                                                <span className="text-[10px] font-bold text-slate-500">{new Date(exp.date).toLocaleDateString('ar-EG')}</span>
                                                <span className="text-[10px] font-bold text-indigo-400">{exp.paymentSource}</span>
                                                {exp.vendor && <span className="text-[10px] font-bold text-slate-400 italic">@ {exp.vendor}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <p className="text-lg font-black text-white">{(exp.amount || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                        <button 
                                            onClick={() => handleDelete(exp._id)}
                                            className="p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-xl"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-600">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">لا توجد مصروفات مسجلة بعد</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Analytics */}
                <div className="space-y-8">
                    {/* Basic vs Luxury Chart Placeholder */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-lg font-black text-white mb-6">الأساسي مقابل الكمالي</h3>
                        <div className="space-y-6">
                            <NecessityBar label="أساسي" amount={stats?.basicVsLuxury?.basic} total={stats?.totalSpentThisMonth} color="blue" />
                            <NecessityBar label="كمالي" amount={stats?.basicVsLuxury?.luxury} total={stats?.totalSpentThisMonth} color="orange" />
                        </div>
                        <div className="mt-8 p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                            <p className="text-[10px] font-bold text-blue-400 leading-relaxed">
                                {stats?.basicVsLuxury?.ratio > 30 
                                    ? "⚠️ إنفاقك الكمالي مرتفع هذا الشهر (تجاوز 30%). حاول التركيز على الأساسيات."
                                    : "✅ توزيع إنفاقك ممتاز وواعي."}
                            </p>
                        </div>
                    </div>

                    {/* Smart Tips */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> نصيحة ذكية
                        </h3>
                        <p className="text-sm text-indigo-100 leading-relaxed italic">
                            "أكبر بند إنفاق لديك حالياً هو <span className="text-white font-black underline">{stats?.topCategory}</span>. إذا قمت بخفضه بنسبة 15%، ستوفر حوالي {(stats?.totalSpentThisMonth * 0.05).toFixed(0)} ج.م إضافية هذا الشهر."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlStat = ({ label, val, color, isText }) => (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl group hover:border-slate-700 transition-all">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">{label}</p>
        <p className={`text-xl font-black text-white`}>
            {isText ? val : (val || 0).toLocaleString()} {!isText && <span className="text-[10px] opacity-50">ج.م</span>}
        </p>
    </div>
);

const NecessityBar = ({ label, amount, total, color }) => {
    const percent = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
                <span className="text-xs font-bold text-slate-400">{label}</span>
                <span className="text-xs font-black text-white">{percent}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold">{(amount || 0).toLocaleString()} ج.م</p>
        </div>
    );
};

export default Expenses;
