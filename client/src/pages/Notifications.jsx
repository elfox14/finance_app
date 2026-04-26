import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Bell, CheckCircle, AlertCircle, 
    Clock, Trash2, Calendar, Info, 
    ArrowUpRight, ArrowDownLeft, Wallet, X
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            fetchNotifications();
        } catch (err) { console.error(err); }
    };

    const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.isRead;
        return true;
    });

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white italic">مركز التنبيهات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">اشعارات تلقائية حول الأقساط، الديون، وحالة الميزانية</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit self-end md:self-auto">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>الكل</button>
                    <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'unread' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>غير المقروءة</button>
                </div>
            </header>

            <div className="space-y-4 px-4 md:px-0">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-[2.5rem]">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-4 opacity-50">
                            <Bell size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">لا توجد تنبيهات حالياً</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div 
                            key={notif._id} 
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                            className={`group relative p-6 rounded-[2rem] border transition-all cursor-pointer ${notif.isRead ? 'bg-slate-900/40 border-slate-800 opacity-70' : 'bg-slate-900 border-blue-500/20 shadow-xl shadow-blue-900/5'}`}
                        >
                            <div className="absolute top-4 left-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all flex items-center gap-1">
                                <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                    notif.type === 'loan_installment' ? 'bg-blue-600/10 text-blue-500' :
                                    notif.type === 'budget_alert' ? 'bg-red-500/10 text-red-500' :
                                    'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                    {notif.type === 'budget_alert' ? <AlertCircle size={24} /> : <Info size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-white text-sm md:text-base">{notif.title}</h4>
                                        {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
                                    </div>
                                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{notif.message}</p>
                                    <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase flex items-center gap-1">
                                        <Clock size={10} /> {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
