import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    AlertTriangle, TrendingUp, Clock, CreditCard, 
    Landmark, Zap, ShieldAlert, Sparkles, CheckCircle2,
    AlertCircle, PieChart, Info, ArrowRight, Wallet
} from 'lucide-react';

const iconMap = {
    'AlertTriangle': AlertTriangle,
    'Clock': Clock,
    'CreditCard': CreditCard,
    'TrendingUp': TrendingUp,
    'Zap': Zap,
    'ShieldAlert': ShieldAlert,
    'Sparkles': Sparkles,
    'AlertCircle': AlertCircle,
    'Landmark': Landmark,
    'PieChart': PieChart,
    'Wallet': Wallet
};

const Notifications = () => {
    const [data, setData] = useState({ alerts: [], opportunities: [], summary: {} });
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setData(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const { alerts, opportunities, summary } = data;

    return (
        <div className="space-y-8 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">التنبيهات والفرص</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">نظام الرقابة الذكي للمخاطر واستكشاف فرص التحسين المالي</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-red-900/10 border border-red-500/20 px-6 py-3 rounded-2xl text-center">
                        <p className="text-[10px] text-red-500 font-bold uppercase mb-1">مخاطر حرجة</p>
                        <p className="text-2xl font-black text-red-400">{summary.criticalCount || 0}</p>
                    </div>
                    <div className="bg-blue-900/10 border border-blue-500/20 px-6 py-3 rounded-2xl text-center">
                        <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">فرص تحسين</p>
                        <p className="text-2xl font-black text-blue-400">{summary.opportunitiesCount || 0}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-0">
                {/* 🚨 Alerts Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-red-500" /> تنبيهات المخاطر والرقابة
                    </h2>
                    
                    {alerts.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-emerald-500/30 rounded-[2.5rem] bg-emerald-900/10 text-center flex flex-col items-center">
                            <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                            <p className="text-emerald-400 font-black text-xl mb-2">لا توجد تنبيهات حرجة!</p>
                            <p className="text-emerald-500/70 text-sm">وضعك المالي وميزانياتك والتزاماتك في السليم تماماً.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert) => {
                                const Icon = iconMap[alert.icon] || AlertCircle;
                                return (
                                    <div key={alert.id} className={`p-6 rounded-[2rem] border ${alert.severity === 'critical' ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-900 border-slate-800'} relative overflow-hidden group hover:-translate-y-1 transition-all`}>
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className={`p-3 rounded-2xl ${alert.bgColor} ${alert.color} shrink-0`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                                        {alert.severity === 'critical' ? 'حرج' : 'متابعة'}
                                                    </span>
                                                </div>
                                                <p className="text-white font-bold text-base leading-relaxed mb-3">{alert.message}</p>
                                                {alert.suggested_action && (
                                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                                                        <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الإجراء المقترح</p>
                                                            <p className="text-sm text-slate-300 font-bold">{alert.suggested_action}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 💡 Opportunities Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-6">
                        <Sparkles className="text-blue-500" /> فرص التحسين (Insights)
                    </h2>
                    
                    {opportunities.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/30 text-center flex flex-col items-center">
                            <Info size={48} className="text-slate-700 mb-4" />
                            <p className="text-slate-500 font-black text-xl mb-2">لا توجد فرص متاحة حالياً</p>
                            <p className="text-slate-600 text-sm">سيقوم النظام باقتراح تحسينات عندما تتوفر بيانات تدعم ذلك.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {opportunities.map((opp) => {
                                const Icon = iconMap[opp.icon] || Sparkles;
                                return (
                                    <div key={opp.id} className="p-6 rounded-[2rem] border bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border-blue-500/20 relative overflow-hidden group hover:-translate-y-1 transition-all">
                                        <div className="absolute top-0 left-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                            <Icon size={100} className={opp.color} />
                                        </div>
                                        <div className="flex items-start gap-4 relative z-10">
                                            <div className={`p-3 rounded-2xl ${opp.bgColor} ${opp.color} shrink-0`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-500/20 text-blue-400">فرصة تحسين</span>
                                                </div>
                                                <p className="text-white font-bold text-base leading-relaxed mb-3">{opp.message}</p>
                                                {opp.suggested_action && (
                                                    <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/50 flex items-start gap-3">
                                                        <ArrowRight size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] text-blue-500/70 font-bold uppercase mb-1">الاستفادة من الفرصة</p>
                                                            <p className="text-sm text-blue-200 font-bold">{opp.suggested_action}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
