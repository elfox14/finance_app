import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Receipt, Calendar, 
    TrendingUp, ShieldCheck, DollarSign, 
    ArrowUpRight, Clock, X, Landmark,
    Coins, BarChart3, Sparkles, CheckCircle2,
    Timer, Info, ChevronDown, ChevronUp
} from 'lucide-react';

const payoutFrequencies = ['شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي', 'نهاية المدة'];

const Certificates = () => {
    const [certs, setCerts]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showAddModal, setShowAdd]= useState(false);
    const [expandedId, setExpanded] = useState(null);

    const [newCertForm, setForm] = useState({
        certificateName: '', bankName: '', principalAmount: '', 
        interestRate: '', durationMonths: '', startDate: '', 
        payoutFrequency: 'شهري', returnType: 'ثابت', notes: ''
    });

    const fetchCerts = async () => {
        try {
            const res = await api.get('/certificates');
            setCerts(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCerts(); }, []);

    const handleCreateCert = async (e) => {
        e.preventDefault();
        try {
            await api.post('/certificates', newCertForm);
            setShowAdd(false);
            setForm({ certificateName: '', bankName: '', principalAmount: '', interestRate: '', durationMonths: '', startDate: '', payoutFrequency: 'شهري', returnType: 'ثابت', notes: '' });
            fetchCerts();
        } catch (err) { alert('خطأ في إضافة الشهادة'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/certificates/${id}`);
            fetchCerts();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    // Aggregate stats
    const totalPrincipal   = certs.reduce((s, c) => s + (c.principalAmount || 0), 0);
    const totalMonthlyYield = certs.reduce((s, c) => {
        const analytics = c.analytics || {};
        return s + (analytics.monthlyYield || 0);
    }, 0);
    const totalExpectedReturn = certs.reduce((s, c) => {
        const analytics = c.analytics || {};
        return s + (analytics.totalExpectedReturn || 0);
    }, 0);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="space-y-10 fade-in text-right pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">إدارة شهادات الاستثمار</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">تتبع محفظة شهاداتك وحساب العوائد والعائد التراكمي</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} /> إضافة شهادة
                </button>
            </header>

            {/* Summary Cards */}
            {certs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">إجمالي الأصول المستثمرة</p>
                        <p className="text-2xl font-black text-white">{totalPrincipal.toLocaleString()} <span className="text-xs opacity-40">ج.م</span></p>
                        <p className="text-xs text-slate-600 mt-1">{certs.length} شهادة نشطة</p>
                    </div>
                    <div className="bg-emerald-900/30 border border-emerald-500/20 p-6 rounded-3xl shadow-xl">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2">العائد الشهري المجمع</p>
                        <p className="text-2xl font-black text-emerald-400">{totalMonthlyYield.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs opacity-40">ج.م</span></p>
                        <p className="text-xs text-emerald-700 mt-1">دخل ثابت متوقع شهرياً</p>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500/20 p-6 rounded-3xl shadow-xl">
                        <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">إجمالي العائد المتوقع</p>
                        <p className="text-2xl font-black text-blue-400">{totalExpectedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs opacity-40">ج.م</span></p>
                        <p className="text-xs text-blue-800 mt-1">حتى انتهاء جميع الشهادات</p>
                    </div>
                </div>
            )}

            {/* Certificates List */}
            {certs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-[3rem] mx-4 md:mx-0">
                    <ShieldCheck size={64} className="text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold text-lg">لا توجد شهادات مسجلة بعد</p>
                    <p className="text-slate-600 text-sm mt-2">ابدأ بإضافة شهادتك الاستثمارية الأولى</p>
                </div>
            ) : (
                <div className="space-y-6 px-4 md:px-0">
                    {certs.map((cert) => {
                        const analytics = cert.analytics || {};
                        const isExpanded = expandedId === cert._id;
                        const daysLeft = analytics.maturityDate 
                            ? Math.max(0, Math.ceil((new Date(analytics.maturityDate) - new Date()) / (1000 * 60 * 60 * 24)))
                            : 0;
                        const progressPercent = cert.durationMonths 
                            ? Math.min(100, ((cert.durationMonths * 30 - daysLeft) / (cert.durationMonths * 30)) * 100)
                            : 0;

                        return (
                            <div key={cert._id} className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden hover:border-emerald-500/20 transition-all">
                                {/* Card Header */}
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-emerald-600/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                                                <ShieldCheck size={26} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">{cert.certificateName}</h3>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{cert.bankName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1.5 bg-emerald-600/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20">
                                                {cert.interestRate}% سنوي
                                            </span>
                                            <button onClick={() => handleDelete(cert._id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Main Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">المبلغ الأساسي</p>
                                            <p className="text-lg font-black text-white">{cert.principalAmount?.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-600/5 rounded-2xl border border-emerald-500/10">
                                            <p className="text-[9px] text-emerald-500 font-bold uppercase mb-1">العائد الشهري</p>
                                            <p className="text-lg font-black text-emerald-400">{(analytics.monthlyYield || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                                            <p className="text-[9px] text-blue-400 font-bold uppercase mb-1">إجمالي العائد</p>
                                            <p className="text-lg font-black text-blue-400">{(analytics.totalExpectedReturn || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="p-4 bg-amber-600/5 rounded-2xl border border-amber-500/10">
                                            <p className="text-[9px] text-amber-400 font-bold uppercase mb-1">الأيام المتبقية</p>
                                            <p className="text-lg font-black text-amber-400">{daysLeft} <span className="text-[10px] opacity-60">يوم</span></p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 font-bold">تقدم المدة</span>
                                            <span className="text-[10px] text-slate-400 font-black">{progressPercent.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[9px] text-slate-600">
                                                {analytics.maturityDate && new Date(cert.startDate).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                                <Calendar size={10} />
                                                الاستحقاق: {analytics.maturityDate && new Date(analytics.maturityDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : cert._id)}
                                        className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-bold transition-all"
                                    >
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        {isExpanded ? 'إخفاء التفاصيل' : 'عرض جدول العوائد التفصيلي'}
                                    </button>
                                </div>

                                {/* Expanded: Yield Schedule */}
                                {isExpanded && (
                                    <div className="border-t border-slate-800 p-8 bg-slate-950/50">
                                        <h4 className="text-sm font-black text-white mb-6 flex items-center gap-2">
                                            <BarChart3 size={16} className="text-emerald-500" /> جدول توزيع العوائد التقديرية
                                        </h4>
                                        <div className="space-y-3">
                                            {generateYieldSchedule(cert).map((row, i) => (
                                                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${row.isPast ? 'bg-slate-900/30 border-slate-800/50 opacity-50' : row.isNext ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-slate-900/20 border-slate-800/30'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${row.isPast ? 'bg-emerald-500/10 text-emerald-500' : row.isNext ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                            {row.isPast ? <CheckCircle2 size={14} /> : i + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{row.date}</p>
                                                            {row.isNext && <p className="text-[9px] text-emerald-500 font-black">الدفعة القادمة</p>}
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm font-black ${row.isPast ? 'text-emerald-500' : row.isNext ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                        +{row.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total Summary */}
                                        <div className="mt-6 p-5 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-emerald-300">إجمالي العائد + الأصل عند الاستحقاق</span>
                                                <span className="text-xl font-black text-emerald-400">
                                                    {((analytics.totalExpectedReturn || 0) + (cert.principalAmount || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Certificate Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAdd(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500" /> إضافة شهادة استثمار جديدة
                        </h2>
                        <form onSubmit={handleCreateCert} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">اسم الشهادة</label>
                                <input required placeholder="شهادة البلاتينيوم، ادخاري..." className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={newCertForm.certificateName} onChange={e => setForm({ ...newCertForm, certificateName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">اسم البنك</label>
                                <input required placeholder="بنك مصر، الأهلي المصري..." className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={newCertForm.bankName} onChange={e => setForm({ ...newCertForm, bankName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">المبلغ الأساسي (ج.م)</label>
                                <input type="number" required placeholder="50000" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl outline-none focus:border-emerald-500 transition-all"
                                    value={newCertForm.principalAmount} onChange={e => setForm({ ...newCertForm, principalAmount: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">سعر الفائدة السنوي %</label>
                                <input type="number" required step="0.01" placeholder="25" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl outline-none focus:border-emerald-500 transition-all"
                                    value={newCertForm.interestRate} onChange={e => setForm({ ...newCertForm, interestRate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">المدة (بالشهور)</label>
                                <input type="number" required placeholder="36" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl outline-none focus:border-emerald-500 transition-all"
                                    value={newCertForm.durationMonths} onChange={e => setForm({ ...newCertForm, durationMonths: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">تاريخ البداية</label>
                                <input type="date" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                    value={newCertForm.startDate} onChange={e => setForm({ ...newCertForm, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">دورية صرف الفائدة</label>
                                <select className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none"
                                    value={newCertForm.payoutFrequency} onChange={e => setForm({ ...newCertForm, payoutFrequency: e.target.value })}>
                                    {payoutFrequencies.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">نوع العائد</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['ثابت', 'متغير'].map(t => (
                                        <button key={t} type="button"
                                            onClick={() => setForm({ ...newCertForm, returnType: t })}
                                            className={`py-4 rounded-2xl font-black text-sm transition-all ${newCertForm.returnType === t ? 'bg-emerald-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}
                                        >{t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Live Preview */}
                            {newCertForm.principalAmount && newCertForm.interestRate && (
                                <div className="md:col-span-2 p-5 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2">معاينة فورية</p>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-[9px] text-slate-500">شهري</p>
                                            <p className="text-emerald-400 font-black text-lg">
                                                {((Number(newCertForm.principalAmount) * Number(newCertForm.interestRate) / 100) / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500">سنوي</p>
                                            <p className="text-emerald-400 font-black text-lg">
                                                {(Number(newCertForm.principalAmount) * Number(newCertForm.interestRate) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500">إجمالي العائد</p>
                                            <p className="text-emerald-400 font-black text-lg">
                                                {(Number(newCertForm.principalAmount) * Number(newCertForm.interestRate) / 100 * (Number(newCertForm.durationMonths) / 12)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="md:col-span-2 w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2">
                                <ShieldCheck size={20} /> حفظ الشهادة وحساب العوائد
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper: generate yield schedule
function generateYieldSchedule(cert) {
    const analytics = cert.analytics || {};
    const monthlyYield = analytics.monthlyYield || 0;
    const freq = cert.payoutFrequency;
    const startDate = new Date(cert.startDate);
    const maturity = analytics.maturityDate ? new Date(analytics.maturityDate) : new Date();
    const now = new Date();
    const schedule = [];

    let step = 1;
    if (freq === 'ربع سنوي')    step = 3;
    if (freq === 'نصف سنوي')    step = 6;
    if (freq === 'سنوي')         step = 12;
    if (freq === 'نهاية المدة')  step = cert.durationMonths || 12;

    const payoutAmount = monthlyYield * step;
    let currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + step);

    let nextFound = false;
    while (currentDate <= maturity && schedule.length < 24) {
        const isPast = currentDate < now;
        const isNext = !isPast && !nextFound;
        if (isNext) nextFound = true;

        schedule.push({
            date: currentDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
            amount: payoutAmount,
            isPast,
            isNext
        });

        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + step);
    }

    return schedule;
}

export default Certificates;
