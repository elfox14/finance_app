import { useState, useEffect } from 'react';
import api from '../api/axios';
import { CreditCard, Plus, Trash2, ShieldCheck, Calendar, Edit2, X } from 'lucide-react';

const Cards = () => {
    const [cards, setCards] = useState([]);
    const [form, setForm] = useState({
        cardName: '', bankName: '', cardType: 'مشتريات', creditLimit: '', statementDay: 1, dueDay: 25
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchCards = async () => {
        try {
            const res = await api.get('/cards');
            setCards(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchCards(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/cards/${editingId}`, form);
                setEditingId(null);
            } else {
                await api.post('/cards', form);
            }
            setForm({ cardName: '', bankName: '', cardType: 'مشتريات', creditLimit: '', statementDay: 1, dueDay: 25 });
            fetchCards();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (card) => {
        setEditingId(card._id);
        setForm({
            cardName: card.cardName,
            bankName: card.bankName,
            cardType: card.cardType,
            creditLimit: card.creditLimit,
            statementDay: card.statementDay,
            dueDay: card.dueDay
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/cards/${id}`);
            fetchCards();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">مركز البطاقات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editingId ? <Edit2 className="text-indigo-400" /> : <Plus className="text-blue-500" />}
                            {editingId ? 'تعديل البطاقة' : 'إضافة بطاقة'}
                        </h3>
                        {editingId && (
                            <button onClick={() => {setEditingId(null); setForm({cardName:'', bankName:'', cardType:'مشتريات', creditLimit:'', statementDay:1, dueDay:25});}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم البطاقة" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={form.cardName} onChange={e => setForm({...form, cardName: e.target.value})} required />
                        <input placeholder="البنك" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <select className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.cardType} onChange={e => setForm({...form, cardType: e.target.value})}>
                                <option value="مشتريات">مشتريات</option>
                                <option value="ائتمان">ائتمان</option>
                            </select>
                            <input type="number" placeholder="الحد" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: e.target.value})} required />
                        </div>
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl shadow-lg ${editingId ? 'bg-indigo-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تعديل البطاقة' : 'حفظ البطاقة')}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map((card) => (
                        <div key={card._id} className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl transition-all">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="text-blue-400 font-bold text-sm mb-1">{card.bankName}</div>
                                    <div className="text-2xl font-black text-white">{card.cardName}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(card)} className="text-slate-500 hover:text-blue-400"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(card._id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">الحد الائتماني</p>
                                    <p className="text-xl font-bold text-white">{card.creditLimit.toLocaleString()} ج.م</p>
                                </div>
                                <ShieldCheck className="text-slate-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Cards;
