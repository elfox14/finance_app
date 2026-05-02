import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Users, Calendar, 
    ArrowRightCircle, CheckCircle, Timer, 
    TrendingUp, DollarSign, Receipt, X, MoreVertical, Edit2, Wallet
} from 'lucide-react';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [paymentAccountId, setPaymentAccountId] = useState('');
    const [payoutAccountId, setPayoutAccountId] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    
    const [newGroupForm, setNewGroupForm] = useState({
        groupName: '', totalAmount: '', monthlyAmount: '', durationMonths: '', 
        userPayoutOrder: '', startDate: ''
    });

    const fetchData = async () => {
        try {
            const [groupRes, accRes] = await Promise.all([
                api.get('/groups'),
                api.get('/accounts')
            ]);
            setGroups(Array.isArray(groupRes.data) ? groupRes.data : []);
            const fetchedAccounts = accRes.data.accounts || accRes.data || [];
            const accList = Array.isArray(fetchedAccounts) ? fetchedAccounts : [];
            setAccounts(accList);
            if (accList.length > 0) {
                setPaymentAccountId(accList[0]._id);
                setPayoutAccountId(accList[0]._id);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', newGroupForm);
            setShowAddModal(false);
            setNewGroupForm({ groupName: '', totalAmount: '', monthlyAmount: '', durationMonths: '', userPayoutOrder: '', startDate: '' });
            fetchData();
        } catch (err) { alert('خطأ في إضافة الجمعية'); }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!paymentAccountId) { alert('يرجى اختيار الحساب'); return; }
        try {
            const nextMonth = (selectedGroup.analytics?.monthsPaid || 0) + 1;
            await api.post('/groups/payment', { 
                groupId: selectedGroup._id, 
                amount: selectedGroup.monthlyAmount,
                accountId: paymentAccountId,
                monthNumber: nextMonth 
            });
            setShowPaymentModal(false);
            fetchData();
            alert('تم تسجيل القسط وخصمه من الحساب');
        } catch (err) { alert('خطأ في تسجيل الدفعة'); }
    };

    const handleConfirmPayout = async (e) => {
        e.preventDefault();
        if (!payoutAccountId) { alert('يرجى اختيار الحساب'); return; }
        try {
            await api.put(`/groups/${selectedGroup._id}`, { 
                isPaidOut: true,
                payoutAccountId: payoutAccountId 
            });
            setShowPayoutModal(false);
            fetchData();
            alert('تم تأكيد قبض الجمعية وإيداع المبلغ في الحساب');
        } catch (err) { alert('خطأ في تأكيد القبض'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الجمعية؟')) return;
        try {
            await api.delete(`/groups/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
        setOpenMenuId(null);
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center px-4 md:px-0">
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">الجمعيات والادخار</h1>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 text-sm shadow-xl shadow-blue-900/40">
                    <Plus size={18} /> إضافة جمعية
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-2 md:px-0">
                {groups.map((group) => {
                    const analytics = group.analytics || {};
                    return (
                        <div key={group._id} className="group relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                            <div className="absolute top-8 left-8 z-30">
                                <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === group._id ? null : group._id); }} className="p-2 text-slate-500 hover:text-white bg-slate-800/50 rounded-xl transition-all">
                                    <MoreVertical size={20} />
                                </button>
                                {openMenuId === group._id && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                        <div className="absolute top-12 left-0 w-40 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden scale-in">
                                            <button onClick={() => handleDelete(group._id)} className="w-full flex items-center gap-3 p-4 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                                                <Trash2 size={14} /> حذف الجمعية
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="absolute top-8 left-24 w-12 h-12 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                                <span className="text-[8px] font-black opacity-70">دورك</span>
                                <span className="text-xl font-black">{group.userPayoutOrder}</span>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3"><Users className="text-blue-500" /> {group.groupName}</h3>
                                <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">إجمالي المبلغ: <span className="text-white">{group.totalAmount?.toLocaleString()} ج.م</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-5 bg-slate-800/40 rounded-3xl border border-slate-800 text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-2">القسط الشهري</p>
                                    <p className="font-black text-white text-lg">{group.monthlyAmount?.toLocaleString()} ج.م</p>
                                </div>
                                <div className="p-5 bg-slate-800/40 rounded-3xl border border-slate-800 text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-2">الصافي الحالي</p>
                                    <p className={`font-black text-lg ${analytics.netPosition >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>{analytics.netPosition?.toLocaleString()} ج.م</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black text-slate-500">
                                    <span>اكتمال: {analytics.monthsPaid || 0} من {group.durationMonths} شهور</span>
                                    <span>{Math.round(((analytics.monthsPaid || 0) / group.durationMonths) * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]" style={{ width: `${((analytics.monthsPaid || 0) / group.durationMonths) * 100}%` }}></div>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button onClick={() => { setSelectedGroup(group); setShowPaymentModal(true); }} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <Receipt size={18} /> دفع القسط
                                    </button>
                                    {!group.isPaidOut ? (
                                        <button onClick={() => { setSelectedGroup(group); setShowPayoutModal(true); }} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all">
                                            <DollarSign size={18} /> قبض الجمعية
                                        </button>
                                    ) : (
                                        <div className="flex-1 py-4 bg-slate-800 border border-slate-700 text-emerald-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                                            <CheckCircle size={18} /> تم القبض
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-black text-white mb-8">دفع قسط الجمعية</h2>
                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                                <p className="text-xs text-blue-400 font-bold mb-1">المبلغ المطلوب</p>
                                <p className="text-2xl font-black text-white">{selectedGroup.monthlyAmount.toLocaleString()} ج.م</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-2">الخصم من حساب</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none font-bold focus:border-blue-500" value={paymentAccountId} onChange={e => setPaymentAccountId(e.target.value)} required>
                                    {Array.isArray(accounts) && accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} ({acc.balance.toLocaleString()} ج.م)</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all">تأكيد الدفع</button>
                        </form>
                    </div>
                </div>
            )}

            {showPayoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowPayoutModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h2 className="text-2xl font-black text-white mb-8">قبض مبلغ الجمعية</h2>
                        <form onSubmit={handleConfirmPayout} className="space-y-6">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                <p className="text-xs text-emerald-400 font-bold mb-1">المبلغ المراد قبضه</p>
                                <p className="text-3xl font-black text-white">{selectedGroup.totalAmount.toLocaleString()} ج.م</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 mr-2">الإيداع في حساب</label>
                                <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none font-bold focus:border-emerald-500" value={payoutAccountId} onChange={e => setPayoutAccountId(e.target.value)} required>
                                    {Array.isArray(accounts) && accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name} ({acc.balance.toLocaleString()} ج.م)</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-white shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all">تأكيد الاستلام</button>
                        </form>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <Users className="text-blue-500" /> إضافة جمعية جديدة
                        </h2>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase px-2">اسم الجمعية</label>
                                <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.groupName} onChange={e => setNewGroupForm({...newGroupForm, groupName: e.target.value})} placeholder="مثلاً: جمعية العائلة" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase px-2">مبلغ القبض</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.totalAmount} onChange={e => setNewGroupForm({...newGroupForm, totalAmount: e.target.value})} placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase px-2">القسط الشهري</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.monthlyAmount} onChange={e => setNewGroupForm({...newGroupForm, monthlyAmount: e.target.value})} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase px-2">المدة (شهور)</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.durationMonths} onChange={e => setNewGroupForm({...newGroupForm, durationMonths: e.target.value})} placeholder="12" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase px-2">ترتيبك في القبض</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.userPayoutOrder} onChange={e => setNewGroupForm({...newGroupForm, userPayoutOrder: e.target.value})} placeholder="1" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase px-2">تاريخ البداية</label>
                                <input type="date" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.startDate} onChange={e => setNewGroupForm({...newGroupForm, startDate: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/40 transition-all mt-4">
                                إنشاء الجمعية
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
