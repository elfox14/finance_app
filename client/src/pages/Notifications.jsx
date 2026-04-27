import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Bell, CheckCircle, AlertCircle, AlertTriangle,
    Clock, Trash2, Calendar, Info, 
    ArrowUpRight, ArrowDownLeft, Wallet, X,
    CreditCard, Landmark, Users, TrendingUp,
    Zap, ShieldCheck, Target, Sparkles,
    RefreshCw, ChevronRight
} from 'lucide-react';

const priorityConfig = {
    critical: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-500/10',
        badge: 'bg-red-500/20 text-red-400',
        label: 'حرج',
    },
    medium: {
        bg: 'bg-orange-500/5',
        border: 'border-orange-500/20',
        icon: Clock,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-500/10',
        badge: 'bg-orange-500/20 text-orange-400',
        label: 'تنبيه',
    },
    info: {
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/10',
        icon: Info,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/10',
        badge: 'bg-blue-500/20 text-blue-400',
        label: 'معلومة',
    },
};

const categoryIconMap = {
    loan:    { icon: Landmark,    color: 'text-orange-500', bg: 'bg-orange-500/10' },
    card:    { icon: CreditCard,  color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
    budget:  { icon: Target,      color: 'text-purple-500', bg: 'bg-purple-500/10' },
    debt:    { icon: Users,       color: 'text-red-500',    bg: 'bg-red-500/10'    },
    balance: { icon: Wallet,      color: 'text-emerald-500',bg: 'bg-emerald-500/10'},
    group:   { icon: Users,       color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    default: { icon: Bell,        color: 'text-slate-400',  bg: 'bg-slate-800'     },
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [filter, setFilter]               = useState('all');
    const [refreshing, setRefreshing]       = useState(false);

    const fetchNotifications = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const filtered = notifications.filter(n => {
        if (filter === 'critical') return n.priority === 'critical';
        if (filter === 'medium')   return n.priority === 'medium';
        if (filter === 'info')     return n.priority === 'info';
        return true;
    });

    const counts = {
        critical: notifications.filter(n => n.priority === 'critical').length,
        medium:   notifications.filter(n => n.priority === 'medium').length,
        info:     notifications.filter(n => n.priority === 'info').length,
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 fade-in text-right pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">مركز التنبيهات والقرارات</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تنبيهات ذكية حول الأقساط والديون وحالة الميزانية</p>
                </div>
                <button
                    onClick={fetchNotifications}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold text-sm transition-all hover:border-slate-700"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    تحديث التنبيهات
                </button>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 px-4 md:px-0">
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl text-center">
                    <p className="text-3xl font-black text-red-500">{counts.critical}</p>
                    <p className="text-[10px] text-red-400 font-bold uppercase mt-1">حرجة</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-3xl text-center">
                    <p className="text-3xl font-black text-orange-500">{counts.medium}</p>
                    <p className="text-[10px] text-orange-400 font-bold uppercase mt-1">تنبيهات</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl text-center">
                    <p className="text-3xl font-black text-blue-400">{counts.info}</p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase mt-1">معلومات</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 md:px-0">
                {[
                    { id: 'all',      label: `الكل (${notifications.length})` },
                    { id: 'critical', label: `حرجة (${counts.critical})` },
                    { id: 'medium',   label: `تنبيهات (${counts.medium})` },
                    { id: 'info',     label: `معلومات (${counts.info})` },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-5 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                            filter === tab.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4 px-4 md:px-0">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-[3rem]">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <p className="text-slate-400 font-black text-xl">وضعك المالي ممتاز</p>
                        <p className="text-slate-600 font-bold text-sm mt-2">لا توجد تنبيهات هامة في هذه الفئة</p>
                    </div>
                ) : (
                    filtered.map((notif, i) => {
                        const cfg = priorityConfig[notif.priority] || priorityConfig.info;
                        const catCfg = categoryIconMap[notif.category] || categoryIconMap.default;
                        const PriorityIcon = cfg.icon;
                        const CategoryIcon = catCfg.icon;

                        return (
                            <div
                                key={i}
                                className={`group p-6 rounded-[2rem] border transition-all ${cfg.bg} ${cfg.border} hover:scale-[1.005]`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Category Icon */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${catCfg.bg}`}>
                                        <CategoryIcon size={24} className={catCfg.color} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${cfg.badge}`}>
                                                {cfg.label}
                                            </span>
                                            {notif.category && (
                                                <span className="text-[9px] font-bold text-slate-600 uppercase">
                                                    {notif.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`font-bold text-sm leading-relaxed ${notif.priority === 'critical' ? 'text-red-100' : notif.priority === 'medium' ? 'text-orange-100' : 'text-slate-300'}`}>
                                            {notif.msg}
                                        </p>
                                    </div>

                                    {/* Priority Indicator */}
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                                        <PriorityIcon size={16} className={cfg.iconColor} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Smart Tip */}
            {notifications.length > 0 && counts.critical === 0 && (
                <div className="mx-4 md:mx-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 p-8 rounded-[2.5rem]">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                            <Sparkles size={22} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white mb-2">وضعك المالي مستقر 🎉</h4>
                            <p className="text-emerald-200/70 text-sm leading-relaxed">
                                لا توجد تنبيهات حرجة الآن. استمر في مراقبة إنفاقك ومتابعة الالتزامات القادمة للحفاظ على هذا الأداء الجيد.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
