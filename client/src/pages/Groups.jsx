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
            setGroups(res.data);
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
            const nextMonth = (group.analytics.monthsPaid || 0) + 1;
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
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 text-sm"
                >
                    <Plus size={18} /> إضافة جمعية
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-2 md:px-0">
                {groups.map((group) => (
                    <div key={group._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                        
                        {/* 🔘 Management Menu (Three Dots) - Mobile Friendly */}
                        <div className="absolute top-6 left-6 z-30">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === group._id ? null : group._id); }}
                                className="p-2 text-slate-500 hover:text-white bg-slate-800/50 rounded-xl transition-all"
                            >
                                <MoreVertical size={20} />
                            </button>
                            
                            {openMenuId === group._id && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                    <div className="absolute top-12 left-0 w-40 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden scale-in">
                                        <button className="w-full flex items-center gap-3 p-4 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors">
                                            <Edit2 size={14} /> تعديل البيانات
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(group._id)}
                                            className="w-full flex items-center gap-3 p-4 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors border-t border-slate-700"
                                        >
                                            <Trash2 size={14} /> حذف الجمعية
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="absolute top-6 left-20 w-10 h-10 bg-blue-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg md:top-8 md:left-24">
                            <span className="text-[8px] font-bold opacity-70">دورك</span>
                            <span className="text-lg font-black">{group.userPayoutOrder}</span>
                        </div>

                        <div className="mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                                <Users className="text-blue-500" size={24} /> {group.groupName}
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">المبلغ الإجمالي: <span className="text-white font-bold">{group.totalAmount.toLocaleString()} ج.م</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] mb-1 font-bold uppercase">القسط الشهري</p>
                                <p className="font-black text-white text-sm md:text-base">{group.monthlyAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[9px] mb-1 font-bold uppercase">تاريخ القبض</p>
                                <p className="font-black text-blue-400 text-[10px] md:text-xs">{new Date(group.analytics.payoutDate).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl mb-6 md:mb-8 border ${group.analytics.netPosition >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">صافي الوضع المالي الحالي</p>
                            <p className={`text-xl md:text-2xl font-black ${group.analytics.netPosition >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {group.analytics.netPosition >= 0 ? '+' : ''}{group.analytics.netPosition.toLocaleString()} ج.م
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                <span>التقدم: {group.analytics.monthsPaid} من {group.durationMonths} شهور</span>
                                <span>{Math.round((group.analytics.monthsPaid / group.durationMonths) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${(group.analytics.monthsPaid / group.durationMonths) * 100}%` }}></div>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => handleRecordPayment(group)}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <Receipt size={16} /> دفع القسط
                                </button>
                                <button className={`px-3 md:px-4 py-3 rounded-xl font-bold text-[10px] md:text-sm border ${group.isPaidOut ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                    {group.isPaidOut ? 'تم القبض ✓' : 'لم يُقبض'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Creating Group */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl scale-in overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Users className="text-blue-500" /> إضافة جمعية جديدة</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X /></button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <input placeholder="اسم الجمعية" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newGroupForm.groupName} onChange={e => setNewGroupForm({...newGroupForm, groupName: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="مبلغ القبض الإجمالي" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newGroupForm.totalAmount} onChange={e => setNewGroupForm({...newGroupForm, totalAmount: e.target.value})} required />
                                <input type="number" placeholder="القسط الشهري" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newGroupForm.monthlyAmount} onChange={e => setNewGroupForm({...newGroupForm, monthlyAmount: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="المدة (شهور)" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newGroupForm.durationMonths} onChange={e => setNewGroupForm({...newGroupForm, durationMonths: e.target.value})} required />
                                <input type="number" placeholder="ترتيبك في القبض" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newGroupForm.userPayoutOrder} onChange={e => setNewGroupForm({...newGroupForm, userPayoutOrder: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 mr-2 font-bold uppercase">تاريخ بداية الجمعية</label>
                                <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={newGroupForm.startDate} onChange={e => setNewGroupForm({...newGroupForm, startDate: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl font-black text-white shadow-lg">حفظ الجمعية</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
