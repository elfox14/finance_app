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
            setCards(res.data || []);
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

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center px-4 md:px-0">
                <h1 className="text-2xl md:text-3xl font-black text-white italic">البطاقات الائتمانية</h1>
                <button className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 text-sm">
                    <Plus size={18} /> إضافة بطاقة
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-0">
                {cards.map((card) => {
                    // استخراج التحليلات بأمان فائق
                    const analytics = card.analytics || {};
                    const usagePercent = analytics.usagePercent || 0;

                    return (
                        <div key={card._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                            <div className="absolute top-6 left-6 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                                <button onClick={() => handleDelete(card._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-white">{card.cardName}</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{card.bankName}</p>
                                    </div>
                                    <div className="p-4 bg-blue-600/10 text-blue-500 rounded-2xl">
                                        <CreditCard size={28} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl md:text-3xl font-black text-white">
                                            {(analytics.currentBalance || 0).toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م مستخدم</span>
                                        </p>
                                        <p className={`text-[10px] font-black ${usagePercent > 80 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {usagePercent}% الاستهلاك
                                        </p>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${usagePercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${usagePercent}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => { setSelectedCard(card); setActionForm({...actionForm, type: 'purchase'}); setShowActionModal(true); }}
                                        className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all text-sm"
                                    >
                                        <ArrowDownCircle size={18} className="text-orange-500" /> مشتريات
                                    </button>
                                    <button 
                                        onClick={() => { setSelectedCard(card); setActionForm({...actionForm, type: 'payment'}); setShowActionModal(true); }}
                                        className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all text-sm"
                                    >
                                        <ArrowUpCircle size={18} /> سداد
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Cards;
