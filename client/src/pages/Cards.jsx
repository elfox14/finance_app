import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, CreditCard, Landmark, 
    AlertTriangle, ShieldCheck, Activity, 
    ArrowUpRight, ArrowDownLeft, Calendar, Info
} from 'lucide-react';

const Cards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [actionForm, setActionForm] = useState({ type: 'purchase', amount: '', description: '' });

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
            setActionForm({ type: 'purchase', amount: '', description: '' });
            fetchCards();
        } catch (err) { alert('خطأ في تسجيل العملية'); }
    };

    const getRiskStyles = (status) => {
        switch(status) {
            case 'خطر': return 'bg-red-500 text-white border-red-600 shadow-red-900/40';
            case 'مرتفع': return 'bg-orange-500 text-white border-orange-600 shadow-orange-900/40';
            case 'طبيعي': return 'bg-blue-600 text-white border-blue-700 shadow-blue-900/40';
            default: return 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/40';
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">مركز إدارة الائتمان</h1>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <Plus size={20} /> إضافة بطاقة جديدة
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cards.map((card) => (
                    <div key={card._id} className="relative group">
                        {/* Real Credit Card UI */}
                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 shadow-2xl relative overflow-hidden ${getRiskStyles(card.analytics.riskStatus)}`}>
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 blur-2xl rounded-full -ml-10 -mb-10"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">{card.cardName}</h3>
                                            <p className="text-xs opacity-70">{card.bankName} - {card.cardType}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                        {card.analytics.riskStatus}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <p className="text-[10px] opacity-70 mb-1">الرصيد المستخدم</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-4xl font-black">{card.analytics.usedAmount.toLocaleString()}</p>
                                        <p className="text-sm">ج.م</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>نسبة الاستخدام: {card.analytics.usagePercent}%</span>
                                        <span>المتبقي: {card.analytics.remainingLimit.toLocaleString()} ج.م</span>
                                    </div>
                                    <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden border border-white/5">
                                        <div className="bg-white h-full transition-all duration-1000" style={{ width: `${Math.min(card.analytics.usagePercent, 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-[9px] opacity-70 mb-1">الحد الائتماني</p>
                                        <p className="font-bold text-sm">{card.creditLimit.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] opacity-70 mb-1">أدنى سداد</p>
                                        <p className="font-bold text-sm text-yellow-200">{card.analytics.minPayment}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] opacity-70 mb-1">الاستحقاق</p>
                                        <p className="font-bold text-sm">يوم {card.dueDay}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons (Appears on Hover) */}
                        <div className="flex gap-4 mt-4 px-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                                onClick={() => { setSelectedCard(card); setShowActionModal(true); setActionForm({...actionForm, type: 'purchase'}); }}
                                className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/30 text-xs font-bold"
                            >
                                <ArrowUpRight className="text-red-500" size={16} /> تسجيل شراء
                            </button>
                            <button 
                                onClick={() => { setSelectedCard(card); setShowActionModal(true); setActionForm({...actionForm, type: 'payment'}); }}
                                className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs font-bold"
                            >
                                <ArrowDownLeft className="text-emerald-500" size={16} /> تسجيل سداد
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Modal for Actions */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl scale-in">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className={actionForm.type === 'purchase' ? 'text-red-500' : 'text-emerald-500'} />
                            {actionForm.type === 'purchase' ? 'تسجيل عملية شراء' : 'تسجيل مبلغ مسدد'}
                        </h3>
                        <form onSubmit={handleAddAction} className="space-y-6">
                            <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={actionForm.amount} onChange={e => setActionForm({...actionForm, amount: e.target.value})} required />
                            <input type="text" placeholder="البيان" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-xl outline-none" value={actionForm.description} onChange={e => setActionForm({...actionForm, description: e.target.value})} required />
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowActionModal(false)} className="flex-1 py-4 text-slate-500 font-bold">إلغاء</button>
                                <button type="submit" className={`flex-1 py-4 rounded-xl font-black text-white ${actionForm.type === 'purchase' ? 'bg-red-600 shadow-red-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>تأكيد</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
