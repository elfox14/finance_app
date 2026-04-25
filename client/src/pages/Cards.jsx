import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, CreditCard, Calendar, 
    ArrowUpCircle, ArrowDownCircle, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2, DollarSign
} from 'lucide-react';

const Cards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [actionForm, setActionForm] = useState({ type: 'purchase', amount: '', note: '' });

    const fetchCards = async () => {
        try {
            const res = await api.get('/cards');
            setCards(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCards(); }, []);

    const handleAddAction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards/action', { ...actionForm, cardId: selectedCard._id });
            setShowActionModal(false);
            fetchCards();
        } catch (err) { alert('خطأ في تسجيل العملية'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        try {
            await api.delete(`/cards/${id}`);
            fetchCards();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    const getRiskColor = (percent) => {
        if (percent > 90) return 'text-red-500';
        if (percent > 70) return 'text-orange-500';
        if (percent > 30) return 'text-blue-500';
        return 'text-emerald-500';
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">مركز البطاقات الائتمانية</h1>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Plus size={20} /> إضافة بطاقة
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cards.map((card) => (
                    <div key={card._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                        {/* Action Buttons: Always visible on Mobile, hover on Desktop */}
                        <div className="absolute top-6 left-6 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                            <button onClick={() => handleDelete(card._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-white">{card.cardName}</h3>
                                    <p className="text-slate-500 text-sm font-medium">{card.bankName} - {card.cardType}</p>
                                </div>
                                <div className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl">
                                    <CreditCard size={32} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-3xl font-black text-white">{card.analytics.currentBalance.toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م مستخدم</span></p>
                                    <p className={`text-xs font-bold ${getRiskColor(card.analytics.usagePercent)}`}>
                                        مستوى المخاطرة: {card.analytics.usagePercent}%
                                    </p>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${card.analytics.usagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${card.analytics.usagePercent}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <span>متاح: {card.analytics.availableLimit.toLocaleString()}</span>
                                    <span>الحد الأقصى: {card.limit.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => { setSelectedCard(card); setActionForm({...actionForm, type: 'purchase'}); setShowActionModal(true); }}
                                    className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                                >
                                    <ArrowDownCircle size={18} className="text-orange-500" /> مشتريات
                                </button>
                                <button 
                                    onClick={() => { setSelectedCard(card); setActionForm({...actionForm, type: 'payment'}); setShowActionModal(true); }}
                                    className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all"
                                >
                                    <ArrowUpCircle size={18} /> سداد
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Card Action */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl scale-in">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Receipt className="text-blue-500" /> {actionForm.type === 'purchase' ? 'تسجيل عملية شراء' : 'تسجيل دفعة سداد'}
                        </h3>
                        <form onSubmit={handleAddAction} className="space-y-6 text-right">
                            <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={actionForm.amount} onChange={e => setActionForm({...actionForm, amount: e.target.value})} required />
                            <input type="text" placeholder="ملاحظة (اختياري)" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={actionForm.note} onChange={e => setActionForm({...actionForm, note: e.target.value})} />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowActionModal(false)} className="flex-1 py-4 text-slate-500 font-bold">إلغاء</button>
                                <button type="submit" className="flex-1 py-4 bg-blue-600 rounded-xl font-black text-white shadow-lg">تأكيد</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
