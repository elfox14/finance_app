import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Receipt, Calendar, 
    TrendingUp, ShieldCheck, DollarSign, 
    ArrowUpRight, Clock, X, Landmark,
    Coins, BarChart3, Sparkles, CheckCircle2,
    Timer, Info, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

const payoutFrequencies = ['شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي', 'نهاية المدة'];

const Certificates = () => {
    const [certs, setCerts]         = useState([]);
    const [stats, setStats]         = useState({});
    const [accounts, setAccounts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showAddModal, setShowAdd]= useState(false);
    const [expandedId, setExpanded] = useState(null);

    const [newCertForm, setForm] = useState({
        certificateName: '', bankName: '', principalAmount: '', 
        interestRate: '', durationMonths: '', startDate: '', 
        payoutFrequency: 'شهري', returnType: 'ثابت', linkedAccountId: '', maturityAction: 'إضافة للحساب', notes: ''
    });

    const fetchData = async () => {
        try {
            const [resCerts, resAccs] = await Promise.all([
                api.get('/certificates'),
                api.get('/accounts')
            ]);
            setCerts(Array.isArray(resCerts.data.certificates) ? resCerts.data.certificates : []);
            setStats(resCerts.data.stats || {});
            setAccounts(Array.isArray(resAccs.data) ? resAccs.data : []);
            
            if (resAccs.data?.length > 0) {
                setForm(f => ({ ...f, linkedAccountId: resAccs.data[0]._id }));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateCert = async (e) => {
        e.preventDefault();
        try {
            await api.post('/certificates', newCertForm);
            setShowAdd(false);
            setForm({ certificateName: '', bankName: '', principalAmount: '', interestRate: '', durationMonths: '', startDate: '', payoutFrequency: 'شهري', returnType: 'ثابت', linkedAccountId: accounts[0]?._id || '', maturityAction: 'إضافة للحساب', notes: '' });
            fetchData();
        } catch (err) { alert('خطأ في إضافة الشهادة'); }
    };

    const handleRedeem = async (id) => {
        if (!window.confirm('هل أنت متأكد من استرداد / كسر الشهادة؟ سيتم تحويل الأصل للحساب المرتبط.')) return;
        try {
            await api.put(`/certificates/${id}`, { status: 'redeemed' });
            fetchData();
        } catch (err) { alert('خطأ في الاسترداد'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من مسح السجل؟')) return;
        try {
            await api.delete(`/certificates/${id}`);
            fetchData();
        } catch (err) { alert('خطأ في الحذف'); }
    };

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
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">الشهادات والودائع</h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">تتبع الأصول الاستثمارية والعوائد المتراكمة وفقاً لتواريخ الاستحقاق</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all"
                >
                    <Plus size={20} /> ربط شهادة استثمارية
                </button>
            </header>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
                <ControlStat label="إجمالي الأصول المجمدة" val={stats.totalPrincipal} color="text-white" />
                <ControlStat label="إجمالي العائد المتوقع" val={stats.totalExpectedReturn} color="text-emerald-400" />
                <ControlStat label="العائد المكتسب (حتى اليوم)" val={stats.totalEarnedYield} color="text-blue-400" />
                <ControlStat label="شهادات تستحق قريباً (30 يوم)" val={stats.maturingWithin30Days} color={stats.maturingWithin30Days > 0 ? "text-orange-400" : "text-slate-400"} isText />
            </div>

            {/* Certificates List */}
            {certs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900 border-2 border-slate-800 border-dashed rounded-[3rem] mx-4 md:mx-0">
                    <ShieldCheck size={64} className="text-slate-700 mb-6" />
                    <p className="text-white font-black text-xl mb-2">لا توجد شهادات استثمارية أو ودائع</p>
                    <p className="text-slate-500 text-sm">اربط شهادة استثمارية لتبدأ في تتبع نمو سيولتك المجمدة</p>
                </div>
            ) : (
                <div className="space-y-6 px-4 md:px-0">
                    {certs.map((cert) => {
                        const analytics = cert.analytics || {};
                        const isExpanded = expandedId === cert._id;
                        const daysLeft = analytics.daysLeft || 0;
                        const progressPercent = cert.durationMonths 
                            ? Math.min(100, (analytics.monthsElapsed / cert.durationMonths) * 100)
                            : 0;

                        const statusColors = {
                            active: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30',
                            maturing_soon: 'text-orange-400 bg-orange-900/30 border-orange-500/30',
                            matured: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
                            redeemed: 'text-slate-400 bg-slate-800 border-slate-700'
                        };
                        const statusLabels = {
                            active: 'عائد ساري', maturing_soon: 'يستحق قريباً', matured: 'مستحقة', redeemed: 'مستردة'
                        };

                        return (
                            <div key={cert._id} className={`group bg-slate-900 border rounded-[3rem] shadow-2xl overflow-hidden transition-all ${analytics.currentStatus === 'matured' ? 'border-blue-500/50' : analytics.currentStatus === 'maturing_soon' ? 'border-orange-500/50' : 'border-slate-800 hover:border-emerald-500/20'}`}>
                                {/* Card Header */}
                                <div className="p-8 md:p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${analytics.currentStatus === 'redeemed' ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                <Landmark size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                    {cert.certificateName}
                                                    <span className={`px-3 py-1 text-[10px] font-black rounded-xl border ${statusColors[analytics.currentStatus]}`}>
                                                        {statusLabels[analytics.currentStatus] || cert.status}
                                                    </span>
                                                </h3>
                                                <p className="text-slate-400 text-xs font-bold mt-2">
                                                    البنك: <span className="text-white">{cert.bankName}</span> • الأصل: <span className="text-white">{cert.linkedAccountId?.name || 'غير محدد'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-4 py-2 bg-slate-800 text-emerald-400 text-sm font-black rounded-xl border border-slate-700">
                                                فائدة {cert.interestRate}%
                                            </span>
                                            {analytics.currentStatus !== 'redeemed' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRedeem(cert._id)} className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all">استرداد (كسر)</button>
                                                    <button onClick={() => handleDelete(cert._id)} className="text-[10px] font-bold text-red-400 hover:text-white bg-red-900/20 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-all border border-red-500/20">حذف</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">المبلغ المجمد (الأصل)</p>
                                            <p className="text-xl font-black text-white">{cert.principalAmount?.toLocaleString()} <span className="text-[10px] opacity-50">ج.م</span></p>
                                        </div>
                                        <div className="p-5 bg-emerald-900/10 rounded-2xl border border-emerald-500/10">
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2">العائد المكتسب (الفعلي)</p>
                                            <p className="text-xl font-black text-emerald-400">{(analytics.earnedYield || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px] opacity-50">ج.م</span></p>
                                        </div>
                                        <div className="p-5 bg-blue-900/10 rounded-2xl border border-blue-500/10">
                                            <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">إجمالي العائد المتوقع</p>
                                            <p className="text-xl font-black text-blue-400">{(analytics.totalExpectedReturn || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px] opacity-50">ج.م</span></p>
                                        </div>
                                        <div className="p-5 bg-orange-900/10 rounded-2xl border border-orange-500/10">
                                            <p className="text-[10px] text-orange-400 font-bold uppercase mb-2">الأيام حتى الاستحقاق</p>
                                            <p className="text-xl font-black text-orange-400">{daysLeft} <span className="text-[10px] opacity-50">يوم</span></p>
                                        </div>
                                    </div>

                                    {/* Progress Bar & Maturing Info */}
                                    <div className="space-y-3 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-slate-400 font-bold flex items-center gap-2"><Timer size={14}/> دورة حياة الشهادة ({cert.durationMonths} شهر)</span>
                                            <span className="text-xs text-white font-black">{progressPercent.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${analytics.currentStatus === 'matured' ? 'bg-blue-500' : 'bg-gradient-to-r from-emerald-600 to-teal-400'}`}
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <span className="text-[10px] text-slate-500 font-bold">
                                                البداية: {new Date(cert.startDate).toLocaleDateString('ar-EG')}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold">
                                                الاستحقاق: {analytics.maturityDate && new Date(analytics.maturityDate).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : cert._id)}
                                        className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-2xl text-xs font-black transition-all"
                                    >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        {isExpanded ? 'إخفاء جدول العوائد' : 'عرض جدول التدفقات النقدية والتعليمات'}
                                    </button>
                                </div>

                                {/* Expanded: Yield Schedule */}
                                {isExpanded && (
                                    <div className="border-t border-slate-800 p-8 md:p-10 bg-slate-950/80">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1 space-y-4">
                                                <h4 className="text-sm font-black text-white flex items-center gap-2 mb-6">
                                                    <BarChart3 size={18} className="text-emerald-500" /> جدول العوائد المتوقعة
                                                </h4>
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                                                    {generateYieldSchedule(cert).map((row, i) => (
                                                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${row.isPast ? 'bg-slate-900/30 border-slate-800/50 opacity-60' : row.isNext ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${row.isPast ? 'bg-emerald-500/10 text-emerald-500' : row.isNext ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                                    {row.isPast ? <CheckCircle2 size={16} /> : i + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white">{row.date}</p>
                                                                    {row.isNext && <p className="text-[10px] text-emerald-500 font-black mt-1">الدفعة المستحقة القادمة</p>}
                                                                </div>
                                                            </div>
                                                            <p className={`text-base font-black ${row.isPast ? 'text-emerald-500' : row.isNext ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                                +{row.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="w-full md:w-1/3 flex flex-col gap-4">
                                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">تعليمات الاستحقاق</p>
                                                    <p className="text-lg font-black text-white">{cert.maturityAction}</p>
                                                    <p className="text-xs text-slate-400 mt-2">عند وصول تاريخ الاستحقاق، سيتم التعامل مع قيمة الشهادة بناءً على هذا الخيار.</p>
                                                </div>
                                                <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-3xl">
                                                    <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2">إجمالي النقد المتاح عند الاستحقاق</p>
                                                    <p className="text-3xl font-black text-emerald-400">
                                                        {((analytics.totalExpectedReturn || 0) + (cert.principalAmount || 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs opacity-50">ج.م</span>
                                                    </p>
                                                    <p className="text-[10px] text-emerald-600 font-bold mt-2">الأصل + العائد الإجمالي</p>
                                                </div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-emerald-500/30 w-full max-w-4xl rounded-[3rem] p-8 md:p-12 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAdd(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
                        <h2 className="text-3xl font-black text-white mb-2 italic flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500" /> ربط شهادة استثمار
                        </h2>
                        <p className="text-slate-500 text-sm mb-8">تسجيل شهادة جديدة سيقوم بتخفيض السيولة من الحساب المحدد وتحويلها لـ "أصل استثماري".</p>
                        
                        <form onSubmit={handleCreateCert} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">المبلغ الأساسي المجمد (ج.م)</label>
                                    <input type="number" required placeholder="مثال: 100000" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] font-black text-2xl outline-none focus:border-emerald-500 transition-all text-center"
                                        value={newCertForm.principalAmount} onChange={e => setForm({ ...newCertForm, principalAmount: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">الحساب الممول للشهادة</label>
                                    <select required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] font-bold outline-none focus:border-emerald-500"
                                        value={newCertForm.linkedAccountId} onChange={e => setForm({ ...newCertForm, linkedAccountId: e.target.value })}>
                                        {accounts.map(a => <option key={a._id} value={a._id}>{a.name} ({a.balance} ج.م)</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">اسم البنك</label>
                                    <input required placeholder="مثال: البنك الأهلي المصري" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                        value={newCertForm.bankName} onChange={e => setForm({ ...newCertForm, bankName: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">اسم الشهادة (اختياري)</label>
                                    <input required placeholder="شهادة البلاتينية، ابن مصر..." className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                        value={newCertForm.certificateName} onChange={e => setForm({ ...newCertForm, certificateName: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">الفائدة السنوية %</label>
                                    <input type="number" required step="0.01" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl text-center outline-none focus:border-emerald-500 transition-all"
                                        value={newCertForm.interestRate} onChange={e => setForm({ ...newCertForm, interestRate: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">المدة (بالشهور)</label>
                                    <input type="number" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl text-center outline-none focus:border-emerald-500 transition-all"
                                        value={newCertForm.durationMonths} onChange={e => setForm({ ...newCertForm, durationMonths: e.target.value })} />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">تاريخ الشراء / الربط</label>
                                    <input type="date" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                                        value={newCertForm.startDate} onChange={e => setForm({ ...newCertForm, startDate: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">دورية صرف العائد</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500"
                                        value={newCertForm.payoutFrequency} onChange={e => setForm({ ...newCertForm, payoutFrequency: e.target.value })}>
                                        {payoutFrequencies.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs text-slate-400 font-bold uppercase">إجراءات عند الاستحقاق</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500"
                                        value={newCertForm.maturityAction} onChange={e => setForm({ ...newCertForm, maturityAction: e.target.value })}>
                                        <option value="إضافة للحساب">إضافة الرصيد للحساب (كاش)</option>
                                        <option value="تجديد تلقائي">تجديد تلقائي للمدة</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-emerald-900/30 transition-all flex items-center justify-center gap-3">
                                <ShieldCheck size={24} /> حفظ الشهادة واعتماد أصل جديد
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ControlStat = ({ label, val, color, isText }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl text-center flex flex-col justify-center transition-all hover:border-emerald-500/20">
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{label}</p>
        <p className={`text-2xl font-black ${color}`}>
            {isText ? val : (val || 0).toLocaleString()} {!isText && <span className="text-[10px] opacity-50">ج.م</span>}
        </p>
    </div>
);

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
