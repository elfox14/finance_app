import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Users, Calendar, 
    ArrowRightCircle, CheckCircle, Timer, 
    TrendingUp, DollarSign, Receipt, X, MoreVertical, Edit2
} from 'lucide-react';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [newGroupForm, setNewGroupForm] = useState({
        groupName: '', totalAmount: '', monthlyAmount: '', durationMonths: '', 
        userPayoutOrder: '', startDate: ''
    });

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGroups(); }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', newGroupForm);
            setShowAddModal(false);
            setNewGroupForm({ groupName: '', totalAmount: '', monthlyAmount: '', durationMonths: '', userPayoutOrder: '', startDate: '' });
            fetchGroups();
        } catch (err) { alert('خطأ في إضافة الجمعية'); }
    };

    const handleRecordPayment = async (group) => {
        try {
            const nextMonth = (group.analytics?.monthsPaid || 0) + 1;
            await api.post('/groups/payment', { 
                groupId: group._id, 
                amount: group.monthlyAmount,
                monthNumber: nextMonth 
            });
            fetchGroups();
        } catch (err) { alert('خطأ في تسجيل الدفعة'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الجمعية؟')) return;
        try {
            await api.delete(`/groups/${id}`);
            fetchGroups();
        } catch (err) { alert('خطأ في الحذف'); }
        setOpenMenuId(null);
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center px-4 md:px-0">
                <h1 className="text-2xl md:text-3xl font-black text-white italic">الجمعيات والادخار</h1>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-900/20">
                    <Plus size={18} /> إضافة جمعية
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-2 md:px-0">
                {(Array.isArray(groups) ? groups : []).map((group) => {
                    const analytics = group.analytics || {};
                    return (
                        <div key={group._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                            <div className="absolute top-6 left-6 z-30">
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
                            
                            <div className="absolute top-6 left-20 w-10 h-10 bg-blue-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                                <span className="text-[8px] font-bold opacity-70">دورك</span>
                                <span className="text-lg font-black">{group.userPayoutOrder}</span>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-black text-white flex items-center gap-3"><Users className="text-blue-500" /> {group.groupName}</h3>
                                <p className="text-slate-500 text-xs mt-1">المبلغ الإجمالي: <span className="text-white font-bold">{group.totalAmount?.toLocaleString() || 0} ج.م</span></p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-center">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">القسط الشهري</p>
                                    <p className="font-black text-white text-sm">{group.monthlyAmount?.toLocaleString() || 0}</p>
                                </div>
                                <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-center">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">الوضع المالي</p>
                                    <p className={`font-black text-xs ${analytics.netPosition >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>{analytics.netPosition?.toLocaleString() || 0}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                    <span>التقدم: {analytics.monthsPaid || 0} من {group.durationMonths} شهور</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${((analytics.monthsPaid || 0) / group.durationMonths) * 100}%` }}></div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => handleRecordPayment(group)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2">
                                        <Receipt size={16} /> دفع القسط
                                    </button>
                                    <button className={`px-3 py-3 rounded-xl font-bold text-[10px] border ${group.isPaidOut ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                        {group.isPaidOut ? 'تم القبض ✓' : 'لم يُقبض'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <Users className="text-blue-500" /> إضافة جمعية جديدة
                        </h2>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">اسم الجمعية</label>
                                <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.groupName} onChange={e => setNewGroupForm({...newGroupForm, groupName: e.target.value})} placeholder="مثلاً: جمعية العائلة" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">مبلغ القبض</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.totalAmount} onChange={e => setNewGroupForm({...newGroupForm, totalAmount: e.target.value})} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">القسط الشهري</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.monthlyAmount} onChange={e => setNewGroupForm({...newGroupForm, monthlyAmount: e.target.value})} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">المدة (شهور)</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.durationMonths} onChange={e => setNewGroupForm({...newGroupForm, durationMonths: e.target.value})} placeholder="12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">ترتيبك في القبض</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.userPayoutOrder} onChange={e => setNewGroupForm({...newGroupForm, userPayoutOrder: e.target.value})} placeholder="1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">تاريخ البداية</label>
                                <input type="date" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newGroupForm.startDate} onChange={e => setNewGroupForm({...newGroupForm, startDate: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all mt-4">
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
