import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Plus, Trash2, ShieldCheck, Calendar } from 'lucide-react';

const Cards = () => {
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({
        cardName: '',
        bankName: '',
        cardType: 'مشتريات',
        creditLimit: '',
        statementDay: 1,
        dueDay: 25
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchCards = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/cards`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCards(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/cards`, 
                form,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setForm({ cardName: '', bankName: '', cardType: 'مشتريات', creditLimit: '', statementDay: 1, dueDay: 25 });
            fetchCards();
        } catch (err) {
            alert('حدث خطأ أثناء إضافة البطاقة');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/cards/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchCards();
        } catch (err) {
            alert('خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">مركز البطاقات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Card Form */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="text-blue-500" /> إضافة بطاقة جديدة
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            placeholder="اسم البطاقة (مثلاً: بلاتينيوم)"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.cardName}
                            onChange={(e) => setForm({...form, cardName: e.target.value})}
                            required
                        />
                        <input 
                            placeholder="اسم البنك"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.bankName}
                            onChange={(e) => setForm({...form, bankName: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <select 
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.cardType}
                                onChange={(e) => setForm({...form, cardType: e.target.value})}
                            >
                                <option value="مشتريات">مشتريات</option>
                                <option value="ائتمان">ائتمان</option>
                                <option value="تقسيط">تقسيط</option>
                            </select>
                            <input 
                                type="number"
                                placeholder="الحد الائتماني"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.creditLimit}
                                onChange={(e) => setForm({...form, creditLimit: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">يوم كشف الحساب</label>
                                <input 
                                    type="number" min="1" max="31"
                                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none"
                                    value={form.statementDay}
                                    onChange={(e) => setForm({...form, statementDay: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">يوم الاستحقاق</label>
                                <input 
                                    type="number" min="1" max="31"
                                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none"
                                    value={form.dueDay}
                                    onChange={(e) => setForm({...form, dueDay: e.target.value})}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                        >
                            {loading ? 'جاري الحفظ...' : 'إضافة البطاقة'}
                        </button>
                    </form>
                </div>

                {/* Cards List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.length > 0 ? (
                            cards.map((card) => (
                                <div key={card._id} className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl transition-all hover:scale-[1.02]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">{card.bankName}</div>
                                            <div className="text-2xl font-black text-white">{card.cardName}</div>
                                        </div>
                                        <ShieldCheck className="text-slate-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 italic font-mono">**** **** **** ****</span>
                                            <span className="text-slate-400">{card.cardType}</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-700/50 flex justify-between items-end">
                                            <div>
                                                <p className="text-slate-500 text-xs mb-1">الحد الائتماني</p>
                                                <p className="text-xl font-bold text-white">{card.creditLimit.toLocaleString()} <span className="text-xs font-normal">ج.م</span></p>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-slate-500 text-xs mb-1">يوم الدفع</p>
                                                <p className="font-bold text-white flex items-center gap-1 justify-end"><Calendar size={14} /> {card.dueDay}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(card._id)}
                                        className="absolute bottom-4 left-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                                <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                                <p>لا توجد بطاقات مسجلة حالياً.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cards;
