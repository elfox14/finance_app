import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Search, Filter, 
    TrendingUp, Clock, AlertCircle, 
    ArrowUpRight, ShoppingBag, Coffee,
    Car, Home, CreditCard, Wallet,
    CheckCircle2, Sparkles, Calendar,
    BarChart3, LayoutGrid, List,
    ChevronDown, Info,
    PieChart as PieIcon
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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
            await api.post('/expenses', formData);
            
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

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Prepare Doughnut Chart Data for Categories
    const categoryDataMap = {};
    expenses.forEach(e => {
        categoryDataMap[e.budgetCategory] = (categoryDataMap[e.budgetCategory] || 0) + e.amount;
    });
    
    const doughnutData = {
        labels: Object.keys(categoryDataMap),
        datasets: [{
            data: Object.values(categoryDataMap),
            backgroundColor: [
                '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', 
                '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#64748b'
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Tajawal' } } } },
        cutout: '75%'
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* 1) Control Bar - Stats Summary */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">سجل المصروفات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">تتبع، حلل، وتحكم في إنفاقك اليومي بدقة</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-900/40 hover:scale-105 transition-all"
                >
                    {showForm ? 'إلغاء الإضافة' : <><Plus size={20} /> إضافة مصروف ذكي</>}
                </button>
            </header>

            {/* Smart Feedback Toast */}
            {feedback && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <Sparkles size={20} />
                    <span className="font-bold text-sm">{feedback}</span>
                </div>
            )}

            {/* 4) Smart Entry Form (Conditional) */}
            {showForm && (
                <div className="bg-slate-900 border border-blue-500/30 p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 mx-4 md:mx-0">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <Plus className="text-blue-500" /> تسجيل مصروف جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400">المبلغ (ج.م)</label>
                            <input 
                                type="number" required placeholder="0.00"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-white font-black text-xl focus:border-blue-500 transition-all outline-none"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400">البيان / الوصف</label>
                            <input 
                                type="text" required placeholder="ماذا اشتريت؟"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold text-lg focus:border-blue-500 transition-all outline-none"
                                value={formData.note}
                                onChange={(e) => setFormData({...formData, note: e.target.value})}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 md:col-span-2">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400">الفئة</label>
                                <select 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500"
                                    value={formData.budgetCategory}
                                    onChange={(e) => setFormData({...formData, budgetCategory: e.target.value})}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400">اسم التاجر (اختياري)</label>
                                <input 
                                    type="text" placeholder="مثال: أمازون، كارفور..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500"
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400">مستوى الضرورة</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {necessityLevels.map(lvl => (
                                    <button 
                                        key={lvl} type="button"
                                        onClick={() => setFormData({...formData, necessityLevel: lvl})}
                                        className={`py-4 rounded-2xl text-xs font-black transition-all ${
                                            formData.necessityLevel === lvl 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400">مصدر الدفع</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {paymentSources.map(src => (
                                    <button 
                                        key={src} type="button"
                                        onClick={() => setFormData({...formData, paymentSource: src})}
                                        className={`py-4 rounded-2xl text-[10px] font-black transition-all ${
                                            formData.paymentSource === src 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {src}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="md:col-span-2 w-full bg-blue-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all text-lg mt-2">
                            تأكيد وحفظ المصروف
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 space-y-8">
                    {/* 2) Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ControlStat label="مصاريف الشهر" val={stats?.totalSpentThisMonth} color="text-blue-500" bg="bg-blue-600/10" />
                        <ControlStat label="المتوسط اليومي" val={stats?.dailyAverage} color="text-indigo-500" bg="bg-indigo-600/10" />
                        <ControlStat label="أعلى فئة" val={stats?.topCategory} isText color="text-orange-500" bg="bg-orange-600/10" />
                        <ControlStat label="نسبة الكماليات" val={`${stats?.basicVsLuxury?.ratio}%`} color="text-red-500" bg="bg-red-600/10" />
                    </div>

                    {/* Category Chart */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                            <PieIcon className="text-purple-500" /> توزيع المصروفات بالفئات
                        </h3>
                        <div className="flex-1 min-h-[250px] relative">
                            {Object.keys(categoryDataMap).length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">لا توجد مصاريف هذا الشهر</div>
                            )}
                        </div>
                    </div>

                    {/* 5) History Ledger */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <List className="text-slate-400" /> سجل المصروفات
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"><Search size={18} /></button>
                                <button className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"><Filter size={18} /></button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {expenses.length > 0 ? expenses.map((exp) => (
                                <div key={exp._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-slate-800/30 transition-all gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                                            exp.necessityLevel === 'أساسي' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                                            exp.necessityLevel === 'كمالي' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-700'
                                        }`}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-lg">{exp.note || 'مصروف بدون بيان'}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-xl">{exp.budgetCategory}</span>
                                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Calendar size={10} />{new Date(exp.date).toLocaleDateString('ar-EG')}</span>
                                                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-900/20 px-3 py-1 rounded-xl">{exp.paymentSource}</span>
                                                {exp.vendor && <span className="text-[10px] font-bold text-slate-400 italic">@ {exp.vendor}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <p className="text-xl font-black text-white">{(exp.amount || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                        <button 
                                            onClick={() => handleDelete(exp._id)}
                                            className="p-3 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
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
                    
                    {/* Budget Control Layer */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <BarChart3 className="text-blue-500" /> مراقبة الميزانيات
                        </h3>
                        <div className="space-y-6">
                            {stats?.budgetStatus?.length > 0 ? stats.budgetStatus.map((b, i) => (
                                <div key={i} className="bg-slate-800/30 p-5 rounded-3xl border border-slate-800">
                                    <div className="flex justify-between mb-3">
                                        <span className="font-bold text-white text-sm">{b.category}</span>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-xl ${b.status === 'over' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {b.percent}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
                                        <div className={`h-full transition-all duration-1000 ${b.status === 'over' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${b.percent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                        <span>المنفق: {b.actual?.toLocaleString()}</span>
                                        <span className={b.remaining < 0 ? 'text-red-400' : ''}>المتبقي: {b.remaining?.toLocaleString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-slate-500 bg-slate-800/20 rounded-3xl border border-slate-800/50">
                                    <p className="text-sm font-bold">لا توجد ميزانيات.</p>
                                    <p className="text-xs mt-2">اذهب لقسم الميزانيات لإعدادها.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic vs Luxury Chart Placeholder */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8">الأساسي مقابل الكمالي</h3>
                        <div className="space-y-6">
                            <NecessityBar label="أساسي" amount={stats?.basicVsLuxury?.basic} total={stats?.totalSpentThisMonth} activeColor="bg-blue-500" textColor="text-blue-400" />
                            <NecessityBar label="كمالي" amount={stats?.basicVsLuxury?.luxury} total={stats?.totalSpentThisMonth} activeColor="bg-orange-500" textColor="text-orange-400" />
                        </div>
                        <div className="mt-8 p-5 bg-blue-600/10 rounded-3xl border border-blue-600/20">
                            <p className="text-xs font-bold text-blue-400 leading-relaxed text-center">
                                {stats?.basicVsLuxury?.ratio > 30 
                                    ? "⚠️ إنفاقك الكمالي مرتفع هذا الشهر. حاول التركيز على الأساسيات."
                                    : "✅ توزيع إنفاقك ممتاز وواعي."}
                            </p>
                        </div>
                    </div>

                    {/* Smart Tips */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={80} className="text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                            <Sparkles className="text-yellow-400" size={24} /> نصيحة ذكية
                        </h3>
                        <p className="text-sm text-indigo-100 leading-relaxed italic relative z-10">
                            "أكبر بند إنفاق لديك حالياً هو <span className="text-white font-black underline">{stats?.topCategory || '---'}</span>. إذا قمت بخفضه بنسبة 15%، ستوفر حوالي {((stats?.totalSpentThisMonth || 0) * 0.05).toFixed(0)} ج.م إضافية هذا الشهر."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlStat = ({ label, val, color, bg, isText }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-all flex flex-col items-center justify-center text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">{label}</p>
        <p className={`text-2xl font-black ${color}`}>
            {isText ? val || '---' : (val || 0).toLocaleString()} {!isText && <span className="text-[10px] opacity-50 text-slate-500">ج.م</span>}
        </p>
    </div>
);

const NecessityBar = ({ label, amount, total, activeColor, textColor }) => {
    const percent = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
                <span className="text-sm font-bold text-slate-400">{label}</span>
                <span className={`text-sm font-black ${textColor}`}>{percent}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${activeColor} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 font-bold">{(amount || 0).toLocaleString()} ج.م</p>
        </div>
    );
};

export default Expenses;
