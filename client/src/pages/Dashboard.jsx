import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    TrendingUp, TrendingDown, 
    ArrowUpRight, ArrowDownLeft,
    DollarSign, Activity, Calendar
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard');
            setStats(res.data || {});
        } catch (err) { 
            console.error('🔥 Dashboard Error:', err);
            setStats({});
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const { accountingKPIs = {} } = stats || {};
    
    const netFlow = accountingKPIs.operatingCashFlowMTD || 0;
    const isPositive = netFlow >= 0;

    return (
        <div className="space-y-12 fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">لوحة التحكم</h1>
                <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
                    <Calendar size={14} /> ملخص الأداء المالي للشهر الحالي
                </p>
            </header>

            <div className="px-4 md:px-0 grid grid-cols-1 gap-8">
                
                {/* Net Cash Flow Section - Hero Card */}
                <section>
                    <div className={`relative overflow-hidden p-8 md:p-12 rounded-[3.5rem] border transition-all duration-500 ${
                        isPositive 
                        ? 'bg-emerald-600/10 border-emerald-500/20 shadow-emerald-900/10' 
                        : 'bg-red-600/10 border-red-500/20 shadow-red-900/10'
                    } shadow-2xl`}>
                        
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                            <Activity size={400} className={`absolute -bottom-20 -left-20 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="text-center md:text-right flex-1">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">صافي التدفق النقدي للفترة</p>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h2 className={`text-6xl md:text-8xl font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>
                                        {Math.abs(netFlow).toLocaleString()}
                                        <span className="text-2xl md:text-3xl ml-3 opacity-50">ج.م</span>
                                    </h2>
                                    <div className={`p-4 rounded-3xl ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {isPositive ? <TrendingUp size={48} /> : <TrendingDown size={48} />}
                                    </div>
                                </div>
                                <p className={`text-lg font-bold mt-6 ${isPositive ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                                    {isPositive ? 'أداء إيجابي: إيراداتك تتجاوز مصروفاتك' : 'تنبيه: مصروفاتك تتجاوز إيراداتك لهذا الشهر'}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                                        <ArrowUpRight size={18} />
                                        <span className="text-[10px] font-black uppercase">إجمالي الإيرادات</span>
                                    </div>
                                    <p className="text-2xl font-black text-white">{(accountingKPIs.incomeMTD || 0).toLocaleString()}</p>
                                </div>

                                <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-2 text-red-500">
                                        <ArrowDownLeft size={18} />
                                        <span className="text-[10px] font-black uppercase">إجمالي المصروفات</span>
                                    </div>
                                    <p className="text-2xl font-black text-white">{(accountingKPIs.expensesMTD || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Placeholder for future sections */}
                <section className="py-20 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-600 bg-slate-900/30 px-6 py-3 rounded-full border border-slate-800/50">
                        <Activity size={16} />
                        <span className="text-xs font-bold italic">سيتم إضافة باقي الأقسام تباعاً لتنظيم اللوحة بشكل مثالي</span>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Dashboard;
