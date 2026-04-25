import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Bell, AlertCircle, Clock, CheckCircle2, 
    ArrowRight, Info, Zap, Calendar, 
    Filter, Trash2, X, CheckSquare
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
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

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        if (filter === 'critical') return n.priority === 'high';
        return true;
    });

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 fade-in text-right pb-24 md:pb-10" dir="rtl">
            <header className="px-4 md:px-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white italic">مركز التنبيهات</h1>
                        <p className="text-slate-500 text-xs md:text-sm mt-1">محرك الالتزام المالي الذكي</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center relative">
                        <Bell />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-slate-950 rounded-full animate-ping"></span>
                        )}
                    </div>
                </div>

                {/* Mobile-Friendly Filter Pills */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'unread', label: 'غير مقروء' },
                        { id: 'critical', label: 'عاجل جداً' }
                    ].map(f => (
                        <button 
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-6 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap ${filter === f.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Notification List - Optimized for Mobile Tapping */}
            <div className="space-y-4 px-4 md:px-0">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 border-dashed">
                        <CheckCircle2 className="mx-auto text-slate-700 mb-4" size={48} />
                        <p className="text-slate-500 font-bold">لا توجد تنبيهات حالياً</p>
                    </div>
                ) : (
                    filteredNotifications.map((note) => (
                        <div 
                            key={note._id} 
                            className={`group relative p-5 md:p-6 rounded-3xl border transition-all ${note.isRead ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 shadow-xl'}`}
                        >
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border ${getPriorityStyles(note.priority)}`}>
                                    {note.priority === 'high' ? <Zap size={20} /> : <Info size={20} />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm md:text-base font-black truncate ${note.isRead ? 'text-slate-400' : 'text-white'}`}>
                                            {note.title}
                                        </h4>
                                        <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap mr-2">
                                            {new Date(note.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-none">
                                        {note.message}
                                    </p>
                                    
                                    {/* Action Row - Mobile Visible */}
                                    <div className="mt-4 flex items-center gap-3">
                                        {!note.isRead && (
                                            <button 
                                                onClick={() => markAsRead(note._id)}
                                                className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all"
                                            >
                                                <CheckSquare size={12} /> تم التنفيذ
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteNotification(note._id)}
                                            className="p-1.5 text-slate-600 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Smart Summary Footer for Mobile */}
            <div className="mx-4 md:hidden p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-xs text-white font-bold">ملخص الالتزام</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    لديك {notifications.filter(n => !n.isRead && n.priority === 'high').length} تنبيهات حرجة تتطلب تدخلاً فورياً لتجنب غرامات التأخير.
                </p>
            </div>
        </div>
    );
};

export default Notifications;
