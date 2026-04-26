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
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [actionForm, setActionForm] = useState({ type: 'purchase', amount: '', note: '' });
    const [newCardForm, setNewCardForm] = useState({ cardName: '', bankName: '', creditLimit: '', statementDay: '1', dueDay: '1' });

    const fetchCards = async () => {
        try {
            const res = await api.get('/cards');
            setCards(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCards(); }, []);

    const handleAddAction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards/action', { ...actionForm, cardId: selectedCard._id, description: actionForm.note });
            setShowActionModal(false);
            fetchCards();
        } catch (err) { alert('خطأ في تسجيل العملية'); }
    };

    const handleCreateCard = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cards', newCardForm);
            setShowAddModal(false);
            setNewCardForm({ cardName: '', bankName: '', creditLimit: '', statementDay: '1', dueDay: '1' });
            fetchCards();
        } catch (err) { alert('خطأ في إضافة البطاقة'); }
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
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 text-sm">
                    <Plus size={18} /> إضافة بطاقة
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-0">
                {(Array.isArray(cards) ? cards : []).map((card) => {
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

            {/* Modal إضافة بطاقة */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <CreditCard className="text-blue-500" /> إضافة بطاقة ائتمانية
                        </h2>
                        <form onSubmit={handleCreateCard} className="space-y-4 text-right" dir="rtl">
                            <div className="grid grid-cols-2 gap-4">
                                <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCardForm.cardName} onChange={e => setNewCardForm({...newCardForm, cardName: e.target.value})} placeholder="اسم البطاقة" />
                                <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCardForm.bankName} onChange={e => setNewCardForm({...newCardForm, bankName: e.target.value})} placeholder="اسم البنك" />
                            </div>
                            <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCardForm.creditLimit} onChange={e => setNewCardForm({...newCardForm, creditLimit: e.target.value})} placeholder="الحد الائتماني" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 px-2 font-bold uppercase">يوم صدور الكشف</label>
                                    <input type="number" min="1" max="31" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCardForm.statementDay} onChange={e => setNewCardForm({...newCardForm, statementDay: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 px-2 font-bold uppercase">يوم السداد</label>
                                    <input type="number" min="1" max="31" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCardForm.dueDay} onChange={e => setNewCardForm({...newCardForm, dueDay: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all mt-4">
                                حفظ البطاقة
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal إضافة عملية (مشتريات/سداد) */}
            {showActionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowActionModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-black text-white mb-6">تسجيل {actionForm.type === 'purchase' ? 'مشتريات' : 'سداد قسط'}</h2>
                        <form onSubmit={handleAddAction} className="space-y-4">
                            <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-center text-xl font-black" value={actionForm.amount} onChange={e => setActionForm({...actionForm, amount: e.target.value})} placeholder="المبلغ" />
                            <input className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={actionForm.note} onChange={e => setActionForm({...actionForm, note: e.target.value})} placeholder="ملاحظات (اختياري)" />
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all">
                                تأكيد العملية
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
