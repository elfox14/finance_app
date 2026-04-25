import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, TrendingUp, DollarSign } from 'lucide-react';

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchIncomes = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/incomes`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setIncomes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/incomes`, 
                { amount, source },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAmount('');
            setSource('');
            fetchIncomes();
        } catch (err) {
            alert(err.response?.data?.message || 'حدث خطأ أثناء الإضافة');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الدخل؟')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/incomes/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchIncomes();
        } catch (err) {
            alert('خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة المدخولات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="text-emerald-500" /> إضافة دخل جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">المبلغ (ج.م)</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">مصدر الدخل</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="مثلاً: الراتب الشهري"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                        >
                            {loading ? 'جاري الإضافة...' : 'تسجيل الدخل'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">تاريخ المداخيل</h3>
                        <div className="text-emerald-500 font-bold bg-emerald-500/10 px-4 py-1 rounded-full text-sm">
                            إجمالي: {incomes.reduce((s, i) => s + i.amount, 0).toLocaleString()} ج.م
                        </div>
                    </div>
                    <div className="space-y-4">
                        {incomes.length > 0 ? (
                            incomes.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{item.source}</div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                                <span className="flex items-center gap-1"><DollarSign size={14} /> دخل نقدي</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-xl font-black text-emerald-400">+{item.amount.toLocaleString()} ج.م</div>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-500 italic font-medium">لم تقم بإضافة أي دخل بعد.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Incomes;
