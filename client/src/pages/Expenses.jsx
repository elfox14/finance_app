import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Search, Filter, 
    TrendingUp, Clock, AlertCircle, 
    ArrowUpRight, ShoppingBag, Calendar,
    BarChart3, List, PieChart as PieIcon, Upload, ArrowDownRight
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const categories = ['السكن', 'الطعام', 'النقل', 'الفواتير', 'الصحة', 'الديون', 'الادخار', 'الترفيه', 'التقنية', 'عام', 'أخرى'];
    const paymentMethods = ['كاش', 'بنك', 'بطاقة', 'محفظة', 'تحويل'];

    const [formData, setFormData] = useState({
        amount: '',
        category: 'عام',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'كاش',
        description: '',
        vendor: '',
        expenseType: 'متغير',
        isRecurring: false,
    });

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

    useEffect(() => { fetchData(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', formData);
            setShowForm(false);
            setFormData({ ...formData, amount: '', description: '', vendor: '' });
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

    const doughnutData = {
        labels: Object.keys(stats?.categoryAnalysis || {}),
        datasets: [{
            data: Object.values(stats?.categoryAnalysis || {}),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'],
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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">إدارة المصروفات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">تسجيل دقيق، رقابة محكمة، وتوجيه ذكي للأموال</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-900/40 hover:scale-105 transition-all"
                >
                    {showForm ? 'إلغاء' : <><Plus size={20} /> إضافة مصروف</>}
                </button>
            </header>

            {/* Smart Entry Form */}
            {showForm && (
                <div className="bg-slate-900 border border-blue-500/30 p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 mx-4 md:mx-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <ArrowUpRight className="text-blue-500" /> إدخال مصروف جديد
                        </h3>
                        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-blue-500 text-xs font-bold hover:underline">
                            {showAdvanced ? 'إخفاء الحقول المتقدمة' : 'إظهار الحقول المتقدمة'}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400">المبلغ</label>
                                <input type="number" name="amount" required placeholder="0.00" value={formData.amount} onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-black text-xl focus:border-blue-500 outline-none" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400">الفئة</label>
                                <select name="category" value={formData.category} onChange={handleChange} required
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3 lg:col-span-2">
                                <label className="text-xs font-bold text-slate-400">الوصف (اختياري)</label>
                                <input type="text" name="description" placeholder="ماذا اشتريت؟" value={formData.description} onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-white font-bold text-lg focus:border-blue-500 outline-none" />
                            </div>
                        </div>

                        {showAdvanced && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-800/50 animate-in fade-in">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400">التاريخ</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400">وسيلة الدفع</label>
                                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none">
                                        {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400">المورد / الجهة</label>
                                    <input type="text" name="vendor" value={formData.vendor} onChange={handleChange} placeholder="كارفور، أمازون..." className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400">طبيعة المصروف</label>
                                    <select name="expenseType" value={formData.expenseType} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none">
                                        <option value="متغير">متغير</option>
                                        <option value="ثابت">ثابت</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4 flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                                        <input type="checkbox" name="isRecurring" checked={formData.isRecurring} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700" />
                                        مصروف متكرر
                                    </label>
                                    <button type="button" className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/50">
                                        <Upload size={16} /> إرفاق إيصال
                                    </button>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all text-lg">
                            تسجيل المصروف
                        </button>
                    </form>
                </div>
            )}

            {/* 1) KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                <ControlStat label="إجمالي هذا الشهر" val={stats?.totalSpentThisMonth} color="text-white" bg="bg-blue-600" />
                <ControlStat 
                    label="التغير عن الشهر السابق" 
                    val={`${stats?.momChange > 0 ? '+' : ''}${stats?.momChange}%`} 
                    color={stats?.momChange > 0 ? "text-red-500" : "text-emerald-500"} 
                    bg="bg-slate-900" 
                    icon={stats?.momChange > 0 ? <TrendingUp size={24} className="text-red-500 opacity-50 absolute -right-2 -bottom-2" /> : <ArrowDownRight size={24} className="text-emerald-500 opacity-50 absolute -right-2 -bottom-2" />}
                />
                <ControlStat label="المصروفات الثابتة" val={stats?.fixedTotal} color="text-slate-300" bg="bg-slate-900" />
                <ControlStat label="قيد المراجعة / غير مصنف" val={stats?.uncategorizedCount} isText color="text-orange-500" bg="bg-slate-900" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* 2) Analytics & Charts */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                            <PieIcon className="text-purple-500" /> توزيع الفئات
                        </h3>
                        <div className="flex-1 min-h-[250px] relative">
                            {Object.keys(stats?.categoryAnalysis || {}).length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">لا توجد بيانات كافية</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                            <BarChart3 className="text-blue-500" /> الانحراف عن الميزانية
                        </h3>
                        <div className="space-y-5">
                            {stats?.budgetStatus?.length > 0 ? stats.budgetStatus.map((b, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-300">
                                        <span>{b.category}</span>
                                        <span className={b.status === 'over' ? 'text-red-400' : 'text-emerald-400'}>{b.percent}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${b.status === 'over' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(b.percent, 100)}%` }}></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-sm">لا توجد ميزانيات معدة</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3) Detailed Ledger */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <List className="text-slate-400" /> سجل المصروفات التفصيلي
                        </h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white"><Filter size={18} /></button>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {expenses.length > 0 ? expenses.map((exp) => (
                            <div key={exp._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between group hover:bg-slate-800/30 transition-all gap-4">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                                        exp.status === 'reconciled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                        exp.status === 'new' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-700'
                                    }`}>
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-lg flex items-center gap-2">
                                            {exp.description || 'مصروف عام'} 
                                            {exp.hasReceipt && <span className="bg-slate-800 text-[10px] px-2 py-0.5 rounded text-slate-400">مرفق</span>}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-xl">{exp.category}</span>
                                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Calendar size={10} />{new Date(exp.date).toLocaleDateString('ar-EG')}</span>
                                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-900/20 px-3 py-1 rounded-xl">{exp.paymentMethod}</span>
                                            {exp.vendor && <span className="text-[10px] font-bold text-slate-400 italic">@ {exp.vendor}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6">
                                    <p className="text-xl font-black text-white">{(exp.amount || 0).toLocaleString()} <span className="text-xs opacity-50">ج.م</span></p>
                                    <button onClick={() => handleDelete(exp._id)} className="p-2 text-red-500 bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center text-slate-600">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold">لا توجد تفاصيل لعرضها</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlStat = ({ label, val, color, bg, isText, icon }) => (
    <div className={`${bg} border border-slate-800 p-6 rounded-3xl shadow-xl transition-all flex flex-col items-center justify-center text-center relative overflow-hidden`}>
        {icon}
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 relative z-10">{label}</p>
        <p className={`text-2xl font-black ${color} relative z-10`}>
            {isText ? val || '0' : (val || 0).toLocaleString()} {!isText && val !== undefined && !String(val).includes('%') && <span className="text-[10px] opacity-50">ج.م</span>}
        </p>
    </div>
);

export default Expenses;
