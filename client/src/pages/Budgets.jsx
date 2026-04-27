import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Target, Plus, Trash2, AlertCircle, 
    CheckCircle2, TrendingUp, Utensils, 
    Car, Zap, ShoppingBag, Coffee, ShieldCheck,
    PieChart as PieIcon, Crosshair
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: 'طعام', limit: '', period: 'monthly' });

    const fetchBudgets = async () => {
        try {
            const res = await api.get('/budgets');
            setBudgets(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBudgets(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets', newBudget);
            setShowAddModal(false);
            setNewBudget({ category: 'طعام', limit: '', period: 'monthly' });
            fetchBudgets();
        } catch (err) { alert('خطأ في إنشاء الموازنة'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل تريد حذف هذه الموازنة؟')) return;
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
        } catch (err) { console.error(err); }
    };

    const getCategoryIcon = (cat) => {
        switch(cat) {
            case 'طعام': return <Utensils size={24} />;
            case 'مواصلات': return <Car size={24} />;
            case 'فواتير': return <Zap size={24} />;
            case 'تسوق': return <ShoppingBag size={24} />;
            case 'صحة': return <ShieldCheck size={24} />;
            case 'ترفيه': return <Coffee size={24} />;
            default: return <Target size={24} />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Global Stats Calculation
    const totalLimit = budgets.reduce((acc, b) => acc + (b.limit || 0), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
    const globalPercent = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
    
    // Chart Data
    const chartData = {
        labels: budgets.map(b => b.category),
        datasets: [{
            data: budgets.map(b => b.limit),
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'left', labels: { color: '#94a3b8', font: { family: 'Tajawal' } } } },
        cutout: '75%'
    };

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">إدارة الميزانيات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">السيطرة الذكية على أسقف الإنفاق الشهري</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)} 
                    className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-blue-900/40 hover:scale-105 transition-all"
                >
                    <Plus size={20} /> تخصيص ميزانية جديدة
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* Global Overview Section */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Crosshair size={120} className="text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-8 relative z-10">
                            <Target className="text-blue-500" /> الميزانية الإجمالية للشهر
                        </h3>
                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm text-slate-400 font-bold mb-1">المنفق من الميزانيات المحددة</p>
                                    <p className="text-4xl font-black text-white">{totalSpent.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-slate-400 font-bold mb-1">إجمالي الأسقف</p>
                                    <p className="text-2xl font-black text-blue-400">{totalLimit.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="space-y-3 mt-8">
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${globalPercent > 90 ? 'bg-red-500' : globalPercent > 70 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${globalPercent}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-500">
                                    <span>الاستهلاك الكلي</span>
                                    <span>{globalPercent.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget Distribution Chart */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl flex flex-col">
                        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                            <PieIcon className="text-purple-500" /> توزيع الميزانيات المخططة
                        </h3>
                        <div className="flex-1 min-h-[180px] relative">
                            {budgets.length > 0 ? (
                                <Doughnut data={chartData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">قم بتحديد الميزانيات أولاً لرؤية التحليل</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Individual Budgets */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {budgets.length === 0 ? (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-800 border-dashed rounded-[3rem]">
                            <Target size={64} className="mb-4 text-slate-700" />
                            <p className="font-bold text-white text-lg">لم تقم بتحديد أي ميزانية بعد</p>
                            <p className="text-sm text-slate-500 mt-2">حدد أسقفاً للإنفاق للسيطرة على مصاريفك بذكاء</p>
                        </div>
                    ) : (
                        budgets.map((budget) => {
                            const spent = budget.spent || 0;
                            const limit = budget.limit || 1;
                            const percent = Math.min((spent / limit) * 100, 100);
                            const isOver = spent > limit;

                            return (
                                <div key={budget._id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`p-5 rounded-3xl ${isOver ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600/10 text-blue-500 border border-blue-500/20'} shadow-inner`}>
                                            {getCategoryIcon(budget.category)}
                                        </div>
                                        <button onClick={() => handleDelete(budget._id)} className="p-3 text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <h3 className="text-2xl font-black text-white mb-6">{budget.category}</h3>
                                    
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">المنفق</p>
                                                <p className="text-xl font-black text-white">{spent.toLocaleString()}</p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">السقف</p>
                                                <p className="text-xl font-black text-slate-400">{limit.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : percent > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[10px] font-black uppercase ${isOver ? 'text-red-500 animate-pulse' : percent > 80 ? 'text-orange-500' : 'text-slate-500'}`}>
                                                    {isOver ? 'تم تجاوز الميزانية ⚠️' : percent > 80 ? 'تحذير: اقتربت من السقف' : 'ضمن النطاق الآمن'}
                                                </span>
                                                <span className="text-xs font-black text-white">{percent.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-slate-950 border-2 border-blue-500/30 w-full max-w-md rounded-[3rem] p-10 scale-in shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-8 text-center flex justify-center items-center gap-3">
                            <Target className="text-blue-500" /> تحديد سقف إنفاق
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold">الفئة</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 font-bold"
                                    value={newBudget.category}
                                    onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                                >
                                    {['طعام', 'مواصلات', 'فواتير', 'تسوق', 'صحة', 'تعليم', 'ترفيه', 'سكن', 'عام', 'أخرى'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-slate-400 font-bold">المبلغ الأقصى المسموح شهرياً (ج.م)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl outline-none focus:border-blue-500 font-black text-xl"
                                    placeholder="مثلاً: 5000"
                                    value={newBudget.limit}
                                    onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="submit" className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-xl shadow-blue-900/30 transition-all text-lg">تأكيد الميزانية</button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="py-5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black transition-all">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
