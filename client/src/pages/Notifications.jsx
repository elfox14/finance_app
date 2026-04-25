import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Bell, AlertTriangle, Clock, TrendingUp, 
    Zap, Info, ChevronRight, CreditCard, 
    Landmark, Handshake, Target
} from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            // ترتيب التنبيهات حسب الأولوية (حرج ثم متوسط ثم معلوماتي)
            const priorityMap = { critical: 1, medium: 2, info: 3 };
            const sorted = res.data.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
            setNotifications(sorted);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const getPriorityStyles = (priority) => {
        switch(priority) {
            case 'critical': return 'bg-red-500/10 border-red-500/20 text-red-500';
            case 'medium': return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
            default: return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'AlertTriangle': return <AlertTriangle size={20} />;
            case 'Clock': return <Clock size={20} />;
            case 'CreditCard': return <CreditCard size={20} />;
            case 'TrendingUp': return <TrendingUp size={20} />;
            case 'Zap': return <Zap size={20} />;
            default: return <Info size={20} />;
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">المساعد المالي (التنبيهات)</h1>
                <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-slate-500 text-xs">
                    {notifications.length} تنبيه نشط حالياً
                </div>
            </div>

            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((n, idx) => (
                        <div 
                            key={idx} 
                            className={`p-6 rounded-[2rem] border transition-all flex items-start justify-between group ${getPriorityStyles(n.priority)}`}
                        >
                            <div className="flex items-start gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10`}>
                                    {getIcon(n.icon)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10">
                                            {n.priority === 'critical' ? 'حرج جداً' : n.priority === 'medium' ? 'تنبيه هام' : 'معلومة ميزانية'}
                                        </span>
                                        <span className="text-[10px] opacity-50">• {n.category}</span>
                                    </div>
                                    <h4 className="font-bold text-white text-lg leading-relaxed">{n.msg}</h4>
                                </div>
                            </div>
                            <button className="p-3 hover:bg-white/10 rounded-xl transition-all self-center">
                                <ChevronRight className="rotate-180 opacity-50" size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-xl">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">كل شيء تحت السيطرة!</h3>
                    <p className="text-slate-500 text-sm">لا توجد أي التزامات متأخرة أو تجاوزات في الميزانية حالياً.</p>
                </div>
            )}
        </div>
    );
};

// Simple helper to avoid import error
const CheckCircle = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default Notifications;
