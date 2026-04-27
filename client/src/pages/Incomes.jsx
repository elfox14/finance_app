import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Search, Filter, 
    TrendingUp, Clock, AlertCircle, 
    ArrowDownLeft, Landmark, Wallet,
    CheckCircle2, Sparkles, Calendar,
    BarChart3, LayoutGrid, List,
    ChevronDown, Info, ShieldCheck,
    Coins, Banknote, RefreshCcw,
    PieChart as PieIcon
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [feedback, setFeedback] = useState(null);

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
            
            setFeedback(`تم إضافة الإيراد بقيمة ${formData.amount} ج.م بنجاح.`);
            setTimeout(() => setFeedback(null), 5000);

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

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Prepare Doughnut Chart Data for Income Types
    const typeDataMap = {};
    incomes.forEach(i => {
        typeDataMap[i.incomeType] = (typeDataMap[i.incomeType] || 0) + i.amount;
    });
    
    const doughnutData = {
        labels: Object.keys(typeDataMap),
        datasets: [{
            data: Object.values(typeDataMap),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
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
            {/* 1) Overview Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">سجل الإيرادات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">إدارة التدفقات النقدية الداخلة والسيولة</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all"
                >
                    {showForm ? 'إلغاء الإضافة' : <><Plus size={20} /> تسجيل إيراد جديد</>}
                </button>
            </header>

            {/* Smart Feedback Toast */}
            {feedback && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <Sparkles size={20} />
                    <span className="font-bold text-sm">{feedback}</span>
                </div>
            )}

            {/* 4) Entry Form (Conditional) */}
            {showForm && (
                <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 mx-4 md:mx-0">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                        <Plus className="text-emerald-500" /> إضافة إيراد جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400">المبلغ (ج.م)</label>
                            <input 
                                type="number" required placeholder="0.00"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-white font-black text-xl focus:border-emerald-500 transition-all outline-none"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400">مصدر الدخل (البيان)</label>
                            <input 
                                type="text" required placeholder="مثال: راتب، عمولة، أرباح..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-white font-bold text-lg focus:border-emerald-500 transition-all outline-none"
                                value={formData.source}
                                onChange={(e) => setFormData({...formData, source: e.target.value})}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 md:col-span-2">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400">طبيعة الدخل</label>
                                <select 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-emerald-500"
                                    value={formData.incomeType}
                                    onChange={(e) => setFormData({...formData, incomeType: e.target.value})}
                                >
                                    {incomeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400">حالة التدفق النقدي</label>
                                <select 
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-emerald-500"
                                    value={formData.cashFlowType}
                                    onChange={(e) => setFormData({...formData, cashFlowType: e.target.value})}
                                >
                                    {cashFlowStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
                                <input 
                                    type="checkbox" id="recurring"
                                    className="w-6 h-6 rounded-lg text-emerald-600 bg-slate-900 border-slate-700 cursor-pointer"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                                />
                                <label htmlFor="recurring" className="text-sm font-bold text-white cursor-pointer select-none">إيراد متكرر شهرياً</label>
                            </div>
                        </div>

                        <button type="submit" className="md:col-span-2 w-full bg-emerald-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all text-lg mt-2">
                            تأكيد وحفظ الإيراد
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                <div className="lg:col-span-2 space-y-8">
                    {/* 2) Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <OverviewStat label="إجمالي الدخل" val={stats?.totalIncomeThisMonth} color="text-emerald-500" bg="bg-emerald-600/10" />
                        <OverviewStat label="أعلى مصدر" val={stats?.topSource} isText color="text-blue-500" bg="bg-blue-600/10" />
                        <OverviewStat label="الدخل الثابت" val={`${stats?.fixedRatio}%`} color="text-indigo-500" bg="bg-indigo-600/10" />
                        <OverviewStat label="السيولة المحصلة" val={stats?.collected} color="text-emerald-400" bg="bg-emerald-500/10" />
                    </div>

                    {/* Chart & Stability Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Type Chart */}
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                                <PieIcon className="text-emerald-500" /> توزيع الإيرادات حسب الطبيعة
                            </h3>
                            <div className="flex-1 min-h-[200px] relative">
                                {Object.keys(typeDataMap).length > 0 ? (
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500">لا توجد إيرادات هذا الشهر</div>
                                )}
                            </div>
                        </div>

                        {/* Stability Index */}
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={120} className="text-blue-500" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-white italic">مؤشر الاستقرار المالي</h3>
                                <p className={`text-5xl font-black mt-4 ${stats?.fixedRatio > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {stats?.fixedRatio > 70 ? 'مرتفع' : stats?.fixedRatio > 40 ? 'متوسط' : 'متذبذب'}
                                </p>
                                <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest">Stability Score</p>
                                <p className="text-sm text-slate-400 mt-2">
                                    {stats?.fixedRatio > 70 ? 'مصادر دخلك ثابتة وموثوقة.' : 'اعتمادك على الدخل المتغير كبير.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 5) Income Ledger */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-xl font-black text-white flex items-center gap-3">
                                <List className="text-slate-400" /> سجل التدفقات الداخلة
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"><Search size={18} /></button>
                                <button className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"><Filter size={18} /></button>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {incomes.length > 0 ? incomes.map((inc) => (
                                <div key={inc._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-slate-800/30 transition-all gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                                            inc.cashFlowType === 'محصل' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                            inc.cashFlowType === 'متوقع' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}>
                                            <ArrowDownLeft size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-lg">{inc.source}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-xl ${
                                                    inc.incomeType === 'ثابت' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-slate-800/80 text-slate-400'
                                                }`}>
                                                    {inc.incomeType}
                                                </span>
                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-xl ${
                                                    inc.cashFlowType === 'محصل' ? 'bg-emerald-900/20 text-emerald-400' : 'bg-amber-900/20 text-amber-400'
                                                }`}>{inc.cashFlowType}</span>
                                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Calendar size={10} />{new Date(inc.date).toLocaleDateString('ar-EG')}</span>
                                                {inc.isRecurring && <RefreshCcw size={12} className="text-emerald-500" title="متكرر" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <p className="text-xl font-black text-emerald-400">{(inc.amount || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                        <button 
                                            onClick={() => handleDelete(inc._id)}
                                            className="p-3 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
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
                    <div className={`bg-gradient-to-br ${stats?.coverageRatio >= 1 ? 'from-emerald-900/40 to-blue-900/40 border-emerald-500/30' : 'from-red-900/40 to-orange-900/40 border-red-500/30'} border p-8 rounded-[3rem] shadow-2xl relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck size={100} className="text-white" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-6 relative z-10">قدرة التغطية (Coverage)</h3>
                        <p className="text-5xl font-black text-white italic relative z-10">{stats?.coverageRatio || 0}<span className="text-xl font-normal opacity-50 mr-2">x</span></p>
                        <p className="text-sm text-white/80 mt-6 leading-relaxed relative z-10 font-bold">
                            {stats?.coverageRatio >= 1.5 
                                ? "✅ ممتاز! دخلك الحالي يغطي التزاماتك بأمان ويوفر مساحة جيدة للادخار." 
                                : stats?.coverageRatio >= 1 
                                ? "⚠️ جيد، دخلك يغطي الالتزامات ولكن هامش الأمان ضيق." 
                                : "❌ تنبيه: التزاماتك الحالية تتجاوز دخلك المسجل، يرجى الحذر الشديد."}
                        </p>
                    </div>

                    {/* CashFlow Breakdown */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <Coins className="text-emerald-500" /> حالة السيولة
                        </h3>
                        <div className="space-y-6">
                            <CashFlowIndicator label="محصل (سيولة فعلية في يدك)" val={stats?.collected} total={stats?.totalIncomeThisMonth} activeColor="bg-emerald-500" textColor="text-emerald-400" />
                            <CashFlowIndicator label="متوقع (سيولة مستقبلية)" val={stats?.expected} total={stats?.totalIncomeThisMonth} activeColor="bg-amber-500" textColor="text-amber-400" />
                        </div>
                    </div>

                    {/* Smart Tips */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={80} className="text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                            <Sparkles className="text-yellow-400" size={24} /> نصيحة التحصيل
                        </h3>
                        <p className="text-sm text-indigo-100 leading-relaxed italic relative z-10">
                            "لديك مبالغ متوقعة بقيمة <span className="text-emerald-400 font-black">{stats?.expected?.toLocaleString() || 0} ج.م</span> لم يتم تحصيلها بعد. متابعة هذه المبالغ وتحصيلها في موعدها سيحسن مؤشر السيولة لديك بشكل ملحوظ."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewStat = ({ label, val, color, bg, isText }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-all flex flex-col items-center justify-center text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">{label}</p>
        <p className={`text-2xl font-black ${color}`}>
            {isText ? val || '---' : (val || 0).toLocaleString()} {!isText && <span className="text-[10px] opacity-50 text-slate-500">ج.م</span>}
        </p>
    </div>
);

const CashFlowIndicator = ({ label, val, total, activeColor, textColor }) => {
    const percent = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
                <span className="text-sm font-bold text-slate-400">{label}</span>
                <span className={`text-sm font-black ${textColor}`}>{percent}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${activeColor} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 font-bold">{(val || 0).toLocaleString()} ج.م</p>
        </div>
    );
};

export default Incomes;
