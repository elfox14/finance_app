import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Users, Calendar, 
    ArrowRightCircle, CheckCircle, Timer, 
    TrendingUp, DollarSign, Receipt
} from 'lucide-react';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchGroups(); }, []);

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

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">إدارة الجمعيات والادخار الاجتماعي</h1>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                    <Plus size={20} /> إضافة جمعية جديدة
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {groups.map((group) => (
                    <div key={group._id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        {/* Payout Turn Badge */}
                        <div className="absolute top-6 left-6 w-12 h-12 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                            <span className="text-[10px] font-bold opacity-70">دورك</span>
                            <span className="text-xl font-black">{group.userPayoutOrder}</span>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                <Users className="text-blue-500" /> {group.groupName}
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">المبلغ الإجمالي المستحق: <span className="text-white font-bold">{group.totalAmount.toLocaleString()} ج.م</span></p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[10px] mb-1">القسط الشهري</p>
                                <p className="font-black text-white">{group.monthlyAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <p className="text-slate-500 text-[10px] mb-1">تاريخ القبض</p>
                                <p className="font-black text-blue-400 text-xs">{new Date(group.analytics.payoutDate).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Net Position Indicator */}
                        <div className={`p-5 rounded-3xl mb-8 border ${group.analytics.netPosition >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-400 font-bold">صافي الوضع الحالي</span>
                                <span className={`text-[10px] font-black uppercase ${group.analytics.netPosition >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {group.analytics.netPosition >= 0 ? 'مقبوض / ربح' : 'تمويل قيد الانتظار'}
                                </span>
                            </div>
                            <p className={`text-2xl font-black ${group.analytics.netPosition >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                {group.analytics.netPosition.toLocaleString()} ج.م
                            </p>
                        </div>

                        {/* Progress and Actions */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                <span>التقدم: {group.analytics.monthsPaid} من {group.durationMonths} شهور</span>
                                <span>{((group.analytics.monthsPaid / group.durationMonths) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${(group.analytics.monthsPaid / group.durationMonths) * 100}%` }}></div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => handleRecordPayment(group)}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <Receipt size={16} /> دفع قسط الشهر
                                </button>
                                <button 
                                    className={`px-4 py-3 rounded-xl font-bold text-sm border ${group.isPaidOut ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                >
                                    {group.isPaidOut ? 'تم القبض ✓' : 'لم يُقبض'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Groups;
