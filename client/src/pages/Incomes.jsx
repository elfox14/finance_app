import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Search, Filter, 
    TrendingUp, Clock, AlertCircle, 
    ArrowDownLeft, Landmark, Wallet,
    CheckCircle2, Sparkles, Calendar,
    BarChart3, LayoutGrid, List,
    ChevronDown, Info, ShieldCheck,
    Coins, Banknote, RefreshCcw
} from 'lucide-react';

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        source: '',
        incomeType: 'ثابت',
        cashFlowType: 'محصل',
        account: 'نقدي',
        isRecurring: false,
        recurringPeriod: 'شهري',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const incomeTypes = ['ثابت', 'متغير', 'موسمي', 'استثنائي'];
    const cashFlowStatuses = ['محصل', 'مستحق', 'متوقع'];
    const accounts = ['نقدي', 'بنك', 'محفظة'];

    const fetchData = async () => {
        try {
            const res = await api.get('/incomes');
            setIncomes(res.data.incomes);
            setStats(res.data.stats);
        } catch (err) {
            console.error('Error fetching incomes:', err);
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
            await api.post('/incomes', formData);
            setFormData({
                amount: '',
                source: '',
                incomeType: 'ثابت',
                cashFlowType: 'محصل',
                account: 'نقدي',
                isRecurring: false,
                recurringPeriod: 'شهري',
                date: new Date().toISOString().split('T')[0],
                note: ''
            });
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert('فشل في إضافة الدخل');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الدخل؟')) return;
        try {
            await api.delete(`/incomes/${id}`);
            fetchData();
        } catch (err) {
            alert('فشل في الحذف');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 md:space-y-12 fade-in pb-20" dir="rtl">
            {/* 1) Overview Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">إدارة الإيرادات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">مركز التحكم في التدفقات النقدية الداخلة</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all"
                >
                    {showForm ? 'إلغاء' : <><Plus size={20} /> تسجيل دخل ذكي</>}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 space-y-8">
                    {/* 2) Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <OverviewStat label="إجمالي الدخل" val={stats?.totalIncomeThisMonth} color="emerald" />
                        <OverviewStat label="أعلى مصدر" val={stats?.topSource} isText color="blue" />
                        <OverviewStat label="الدخل الثابت" val={`${stats?.fixedRatio}%`} color="indigo" />
                        <OverviewStat label="قدرة التغطية" val={stats?.coverageRatio} isText color={stats?.coverageRatio < 1 ? 'red' : 'emerald'} />
                    </div>

                    {/* 3) Predictive & Stability Insight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                                <Coins className="text-emerald-500" /> تحليل السيولة الحالية
                            </h3>
                            <div className="space-y-6">
                                <CashFlowIndicator label="محصل (سيولة فعلية)" val={stats?.collected} total={stats?.totalIncomeThisMonth} color="emerald" />
                                <CashFlowIndicator label="متوقع (سيولة مستقبلية)" val={stats?.expected} total={stats?.totalIncomeThisMonth} color="amber" />
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center text-center">
                            <div className="mb-4">
                                <ShieldCheck size={48} className="mx-auto text-blue-500 opacity-20" />
                            </div>
                            <h3 className="text-xl font-black text-white italic">مؤشر الاستقرار المالي</h3>
                            <p className={`text-4xl font-black mt-2 ${stats?.fixedRatio > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {stats?.fixedRatio > 70 ? 'مرتفع' : stats?.fixedRatio > 40 ? 'متوسط' : 'متذبذب'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Stability Score</p>
                        </div>
                    </div>

                    {/* 4) Entry Form (Conditional) */}
                    {showForm && (
                        <div className="bg-slate-900 border-2 border-emerald-600/30 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <Plus className="text-emerald-500" /> إضافة إيراد جديد
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">المبلغ (ج.م)</label>
                                    <input 
                                        type="number" required placeholder="0.00"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-black focus:border-emerald-500 transition-all outline-none"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">مصدر الدخل (البيان)</label>
                                    <input 
                                        type="text" required placeholder="راتب، عمولة، أرباح..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:border-emerald-500 transition-all outline-none"
                                        value={formData.source}
                                        onChange={(e) => setFormData({...formData, source: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">طبيعة الدخل</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                        value={formData.incomeType}
                                        onChange={(e) => setFormData({...formData, incomeType: e.target.value})}
                                    >
                                        {incomeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 mr-2">حالة التدفق النقدى</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none"
                                        value={formData.cashFlowType}
                                        onChange={(e) => setFormData({...formData, cashFlowType: e.target.value})}
                                    >
                                        {cashFlowStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                                    <input 
                                        type="checkbox" id="recurring"
                                        className="w-5 h-5 rounded-lg text-emerald-600 bg-slate-900 border-slate-700"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                                    />
                                    <label htmlFor="recurring" className="text-sm font-bold text-white cursor-pointer">دخل متكرر شهرياً</label>
                                </div>
                                <button type="submit" className="md:col-span-2 w-full bg-emerald-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all mt-4">
                                    تأكيد وحفظ البيانات
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 5) Income Ledger */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-black text-white flex items-center gap-3">
                                <List className="text-slate-500" /> سجل التدفقات الداخلة
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {incomes.length > 0 ? incomes.map((inc) => (
                                <div key={inc._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-slate-800/20 transition-all gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            inc.cashFlowType === 'محصل' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            inc.cashFlowType === 'متوقع' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            <ArrowDownLeft size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{inc.source}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                                                    inc.incomeType === 'ثابت' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                    {inc.incomeType}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-lg">{inc.cashFlowType}</span>
                                                <span className="text-[10px] font-bold text-slate-500">{new Date(inc.date).toLocaleDateString('ar-EG')}</span>
                                                {inc.isRecurring && <RefreshCcw size={12} className="text-emerald-500" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <p className="text-lg font-black text-emerald-500">{(inc.amount || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                        <button 
                                            onClick={() => handleDelete(inc._id)}
                                            className="p-3 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-xl"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-600">
                                    <Banknote size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">لا توجد سجلات دخل حالية</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="space-y-8">
                    {/* Coverage Ratio Card */}
                    <div className={`bg-gradient-to-br ${stats?.coverageRatio >= 1 ? 'from-emerald-900/40 to-blue-900/40 border-emerald-500/30' : 'from-red-900/40 to-orange-900/40 border-red-500/30'} border p-8 rounded-[2.5rem] shadow-xl`}>
                        <h3 className="text-lg font-black text-white mb-4">قدرة التغطية (Coverage)</h3>
                        <p className="text-4xl font-black text-white italic">{stats?.coverageRatio}<span className="text-sm font-normal opacity-50 mr-2">x</span></p>
                        <p className="text-xs text-white/70 mt-4 leading-relaxed">
                            {stats?.coverageRatio >= 1.5 
                                ? "ممتاز! دخلك الحالي يغطي التزاماتك بأمان ويوفر مساحة جيدة للادخار." 
                                : stats?.coverageRatio >= 1 
                                ? "جيد، دخلك يغطي الالتزامات ولكن هامش الأمان ضيق." 
                                : "تنبيه: التزاماتك الحالية تتجاوز دخلك المسجل، يرجى الحذر."}
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> نصيحة التحصيل
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                            "لديك مبالغ متوقعة بقيمة <span className="text-emerald-500 font-bold">{stats?.expected?.toLocaleString()} ج.م</span> لم يتم تحصيلها بعد. التأكد من تحصيلها في موعدها سيحسن مؤشر التغطية لديك."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewStat = ({ label, val, color, isText }) => (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl group hover:border-slate-700 transition-all">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">{label}</p>
        <p className={`text-xl font-black text-white`}>
            {isText ? val : (val || 0).toLocaleString()} {!isText && <span className="text-[10px] opacity-50">ج.م</span>}
        </p>
    </div>
);

const CashFlowIndicator = ({ label, val, total, color }) => {
    const percent = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
                <span className="text-xs font-bold text-slate-400">{label}</span>
                <span className="text-xs font-black text-white">{percent}%</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}-500 transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold">{(val || 0).toLocaleString()} ج.م</p>
        </div>
    );
};

export default Incomes;
