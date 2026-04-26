import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Target, Plus, Trash2, AlertCircle, 
    CheckCircle2, TrendingUp, Utensils, 
    Car, Zap, ShoppingBag, Coffee, MoreVertical
} from 'lucide-react';

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
            case 'طعام': return <Utensils size={20} />;
            case 'مواصلات': return <Car size={20} />;
            case 'فواتير': return <Zap size={20} />;
            case 'تسوق': return <ShoppingBag size={20} />;
            case 'ترفيه': return <Coffee size={20} />;
            default: return <Target size={20} />;
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-24 lg:pb-10" dir="rtl">
            <header className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white italic">إدارة الموازنات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">المحور الرابع: السيطرة على سقف الإنفاق</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-105 transition-all">
                    <Plus size={24} />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
                {budgets.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800 border-dashed rounded-[3rem] opacity-40">
                        <Target size={64} className="mb-4" />
                        <p className="font-bold">ابدأ بتحديد أول موازنة لك</p>
                    </div>
                ) : (
                    budgets.map((budget) => {
                        const spent = budget.spent || 0;
                        const limit = budget.limit || 1;
                        const percent = Math.min((spent / limit) * 100, 100);
                        const isOver = spent > limit;

                        return (
                            <div key={budget._id} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`p-4 rounded-2xl ${isOver ? 'bg-red-500/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>
                                        {getCategoryIcon(budget.category)}
                                    </div>
                                    <button onClick={() => handleDelete(budget._id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-black text-white mb-2">{budget.category}</h3>
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-sm text-slate-500 font-bold">المصروف: <span className="text-white">{spent.toLocaleString()}</span></p>
                                    <p className="text-sm text-slate-500 font-bold">السقف: <span className="text-white">{limit.toLocaleString()}</span></p>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-blue-500'}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] font-black uppercase ${isOver ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                                            {isOver ? 'تم تجاوز الميزانية!' : 'ضمن النطاق الآمن'}
                                        </span>
                                        <span className="text-xs font-black text-white">{percent.toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 scale-in shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-8 text-center">تحديد سقف إنفاق</h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 mr-2 font-bold uppercase">الفئة</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none"
                                    value={newBudget.category}
                                    onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                                >
                                    <option value="طعام">طعام وشراب</option>
                                    <option value="مواصلات">مواصلات</option>
                                    <option value="فواتير">فواتير</option>
                                    <option value="تسوق">تسوق</option>
                                    <option value="ترفيه">ترفيه</option>
                                    <option value="عام">أخرى</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 mr-2 font-bold uppercase">المبلغ الأقصى (شهرياً)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none"
                                    placeholder="مثلاً: 5000"
                                    value={newBudget.limit}
                                    onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">تأكيد الموازنة</button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black">إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
