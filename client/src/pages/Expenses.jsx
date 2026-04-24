import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Calendar, Tag, CreditCard } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('كاش');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchExpenses = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/expenses`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setExpenses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/expenses`, 
                { amount, note, paymentMethod },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setAmount('');
            setNote('');
            fetchExpenses();
        } catch (err) {
            alert('حدث خطأ أثناء الإضافة');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/expenses/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchExpenses();
        } catch (err) {
            alert('خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة المصروفات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit sticky top-32">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="text-blue-500" /> إضافة مصروف جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">المبلغ (ج.م)</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">البيان / الملاحظة</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="مثلاً: مشتريات بقالة"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">طريقة الدفع</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="كاش">كاش</option>
                                <option value="فيزا">فيزا / بطاقة ائتمان</option>
                                <option value="تحويل">تحويل بنكي / محفظة</option>
                            </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                            {loading ? 'جاري الإضافة...' : 'تسجيل المصروف'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6">قائمة المصروفات الأخيرة</h3>
                    <div className="space-y-4">
                        {expenses.length > 0 ? (
                            expenses.map((item) => (
                                <div key={item._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{item.note}</div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                                <span className="flex items-center gap-1"><CreditCard size={14} /> {item.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-xl font-black text-white">{item.amount.toLocaleString()} ج.م</div>
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
                            <div className="text-center py-20 text-slate-500 italic font-medium">لا توجد مصروفات مسجلة بعد. ابدأ بإضافة مصروفك الأول!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
