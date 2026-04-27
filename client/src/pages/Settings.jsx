import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
    User, Mail, Shield, LogOut, Settings as SettingsIcon, 
    Key, Check, AlertCircle, Eye, EyeOff, 
    Save, Palette, Database,
    Download, Trash2, RefreshCw, ChevronRight, Zap, X
} from 'lucide-react';

const Settings = () => {
    const { user, logout, updateUser } = useAuth();
    
    const [nameForm, setNameForm]     = useState({ name: user?.name || '' });
    const [passForm, setPassForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPass, setShowPass]     = useState({ current: false, newP: false, confirm: false });
    const [nameStatus, setNameStatus] = useState(null);
    const [passStatus, setPassStatus] = useState(null);
    const [activeSection, setSection] = useState('profile');

    // حالة مسح جميع البيانات
    const [showNukeModal, setShowNukeModal]     = useState(false);
    const [nukeStep, setNukeStep]               = useState(1);
    const [nukeConfirmText, setNukeConfirmText] = useState('');
    const [nukeLoading, setNukeLoading]         = useState(false);
    const [nukeStatus, setNukeStatus]           = useState(null);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/profile', nameForm);
            updateUser({ name: res.data.name });
            setNameStatus('success');
            setTimeout(() => setNameStatus(null), 3000);
        } catch {
            setNameStatus('error');
            setTimeout(() => setNameStatus(null), 3000);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            setPassStatus('mismatch');
            setTimeout(() => setPassStatus(null), 3000);
            return;
        }
        try {
            await api.put('/auth/password', passForm);
            setPassStatus('success');
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPassStatus(null), 3000);
        } catch {
            setPassStatus('error');
            setTimeout(() => setPassStatus(null), 3000);
        }
    };

    const handleNuke = async () => {
        if (nukeConfirmText !== 'احذف كل البيانات') return;
        setNukeLoading(true);
        try {
            await api.delete('/auth/nuke', { data: { confirmText: nukeConfirmText } });
            setNukeStatus('success');
            setShowNukeModal(false);
            setNukeConfirmText('');
            setNukeStep(1);
        } catch (err) {
            alert(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
        } finally {
            setNukeLoading(false);
        }
    };

    const closeNuke = () => { setShowNukeModal(false); setNukeStep(1); setNukeConfirmText(''); };

    const sections = [
        { id: 'profile',    label: 'الملف الشخصي',      icon: User         },
        { id: 'security',   label: 'الأمان وكلمة المرور', icon: Key          },
        { id: 'appearance', label: 'المظهر',             icon: Palette      },
        { id: 'data',       label: 'إدارة البيانات',     icon: Database     },
        { id: 'danger',     label: 'منطقة الخطر',        icon: AlertCircle  },
    ];

    return (
        <>
        <div className="fade-in pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="mb-10 px-4 md:px-0">
                <h1 className="text-2xl md:text-4xl font-black text-white italic flex items-center gap-3">
                    <SettingsIcon className="text-slate-400" size={32} />
                    إعدادات الحساب
                </h1>
                <p className="text-slate-500 text-xs md:text-sm mt-2">إدارة معلوماتك الشخصية وتفضيلات التطبيق</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 md:px-0">
                
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <nav className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-1 sticky top-4">
                        {sections.map(sec => {
                            const Icon = sec.icon;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => setSection(sec.id)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                                        activeSection === sec.id 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    } ${sec.id === 'danger' ? '!text-red-400 hover:!bg-red-500/10' : ''}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon size={16} />
                                        {sec.label}
                                    </span>
                                    <ChevronRight size={14} className="opacity-50" />
                                </button>
                            );
                        })}
                        <div className="pt-2 border-t border-slate-800 mt-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                            >
                                <LogOut size={16} /> تسجيل الخروج
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-3 space-y-8">

                    {/* === Profile === */}
                    {activeSection === 'profile' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                                        <span className="text-3xl font-black text-white">
                                            {(user?.name || 'U')[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{user?.name}</h2>
                                        <p className="text-slate-500 text-sm">{user?.email}</p>
                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-bold rounded-full border border-blue-500/20">مستخدم نشط</span>
                                    </div>
                                </div>
                                <form onSubmit={handleUpdateName} className="space-y-4">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <User size={18} className="text-blue-500" /> تعديل الاسم
                                    </h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text" required
                                            placeholder="الاسم الجديد"
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 transition-all outline-none"
                                            value={nameForm.name}
                                            onChange={e => setNameForm({ name: e.target.value })}
                                        />
                                        <button type="submit" className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                                            <Save size={18} /> حفظ
                                        </button>
                                    </div>
                                    {nameStatus === 'success' && <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><Check size={16} /> تم تحديث الاسم بنجاح</div>}
                                    {nameStatus === 'error'   && <div className="flex items-center gap-2 text-red-500 text-sm font-bold"><AlertCircle size={16} /> فشل في تحديث الاسم</div>}
                                </form>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                    <Mail size={18} className="text-purple-500" /> البريد الإلكتروني
                                </h3>
                                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                    <p className="text-white font-bold">{user?.email}</p>
                                    <Shield className="text-slate-700" size={18} />
                                </div>
                                <p className="text-slate-600 text-xs mt-3">البريد الإلكتروني لا يمكن تغييره لأغراض أمنية</p>
                            </div>
                        </div>
                    )}

                    {/* === Security === */}
                    {activeSection === 'security' && (
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-8">
                                <Key size={20} className="text-amber-500" /> تغيير كلمة المرور
                            </h3>
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                {[
                                    { label: 'كلمة المرور الحالية', key: 'currentPassword', showKey: 'current' },
                                    { label: 'كلمة المرور الجديدة', key: 'newPassword',     showKey: 'newP',    minLength: 8 },
                                    { label: 'تأكيد كلمة المرور',   key: 'confirmPassword', showKey: 'confirm'  },
                                ].map(field => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400">{field.label}</label>
                                        <div className="relative">
                                            <input
                                                type={showPass[field.showKey] ? 'text' : 'password'}
                                                required
                                                placeholder="••••••••"
                                                minLength={field.minLength}
                                                className={`w-full bg-slate-800 border rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 transition-all outline-none ${
                                                    field.key === 'confirmPassword' && passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword
                                                        ? 'border-red-500' : 'border-slate-700'
                                                }`}
                                                value={passForm[field.key]}
                                                onChange={e => setPassForm({ ...passForm, [field.key]: e.target.value })}
                                            />
                                            <button type="button" onClick={() => setShowPass(p => ({ ...p, [field.showKey]: !p[field.showKey] }))} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                                {showPass[field.showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {passStatus === 'success'  && <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold p-4 bg-emerald-500/5 rounded-2xl"><Check size={16} /> تم تغيير كلمة المرور بنجاح</div>}
                                {passStatus === 'error'    && <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-4 bg-red-500/5 rounded-2xl"><AlertCircle size={16} /> فشل — تأكد من صحة كلمة المرور الحالية</div>}
                                {passStatus === 'mismatch' && <div className="flex items-center gap-2 text-orange-500 text-sm font-bold p-4 bg-orange-500/5 rounded-2xl"><AlertCircle size={16} /> كلمة المرور الجديدة غير متطابقة</div>}

                                <button type="submit" className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-amber-900/20 transition-all flex items-center justify-center gap-2">
                                    <Key size={20} /> تغيير كلمة المرور
                                </button>
                            </form>
                        </div>
                    )}

                    {/* === Appearance === */}
                    {activeSection === 'appearance' && (
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl space-y-6">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <Palette size={20} className="text-emerald-500" /> تفضيلات المظهر
                            </h3>
                            {[
                                { title: 'الوضع الداكن (Dark Mode)', desc: 'التطبيق يعمل حالياً بالوضع الداكن حصرياً لتوفير الطاقة وحماية العين.', badge: null, toggle: true },
                                { title: 'العملة الافتراضية', desc: 'الجنيه المصري (EGP) — الدعم متعدد العملات قادم قريباً', badge: 'ج.م' },
                                { title: 'اللغة', desc: 'العربية — اتجاه RTL', badge: 'العربية' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-800/40 rounded-3xl border border-slate-800">
                                    <div>
                                        <p className="text-white font-bold">{item.title}</p>
                                        <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                                    </div>
                                    {item.toggle ? (
                                        <div className="w-14 h-7 bg-blue-600 rounded-full relative cursor-not-allowed">
                                            <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                                        </div>
                                    ) : (
                                        <span className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-bold text-sm">{item.badge}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* === Data === */}
                    {activeSection === 'data' && (
                        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-xl font-black text-white flex items-center gap-2 mb-6">
                                <Database size={20} className="text-indigo-500" /> إدارة البيانات
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800">
                                    <div>
                                        <p className="text-white font-bold text-sm">تصدير البيانات (CSV)</p>
                                        <p className="text-slate-500 text-xs mt-1">تحميل سجل المصروفات والمدخولات</p>
                                    </div>
                                    <button className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-600/30 transition-all">
                                        <Download size={14} /> تصدير
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-slate-800">
                                    <div>
                                        <p className="text-white font-bold text-sm">مزامنة البيانات</p>
                                        <p className="text-slate-500 text-xs mt-1">تحديث جميع البيانات من الخادم</p>
                                    </div>
                                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-600/30 transition-all">
                                        <RefreshCw size={14} /> مزامنة
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === Danger Zone === */}
                    {activeSection === 'danger' && (
                        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] shadow-xl">
                            <h3 className="text-xl font-black text-red-500 flex items-center gap-2 mb-6">
                                <AlertCircle size={20} /> منطقة الخطر
                            </h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                الإجراءات التالية لا يمكن التراجع عنها. يرجى التأكد تماماً قبل المتابعة.
                            </p>

                            <div className="space-y-4">
                                {/* تسجيل الخروج */}
                                <div className="flex items-center justify-between p-5 bg-slate-900/80 rounded-2xl border border-red-500/10">
                                    <div>
                                        <p className="text-white font-bold text-sm">تسجيل الخروج من جميع الأجهزة</p>
                                        <p className="text-slate-500 text-xs mt-1">إنهاء جميع الجلسات النشطة فوراً</p>
                                    </div>
                                    <button onClick={logout} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-orange-500 transition-all">
                                        <LogOut size={14} /> خروج
                                    </button>
                                </div>

                                {/* ☠️ مسح جميع البيانات */}
                                <div className="p-6 bg-red-950/40 rounded-2xl border-2 border-red-500/30">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                            <Zap size={22} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-red-400 font-black text-base">إعادة تعيين كاملة — حذف كل البيانات</p>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                                يحذف جميع المصروفات والمدخولات والقروض والبطاقات والجمعيات والشهادات والحسابات.{' '}
                                                <span className="text-red-400 font-bold">لا يمكن التراجع عن هذه العملية.</span>
                                            </p>
                                        </div>
                                    </div>

                                    {nukeStatus === 'success' ? (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                            <Check size={20} className="text-emerald-500" />
                                            <p className="text-emerald-400 font-bold text-sm">تم مسح جميع البيانات بنجاح. حسابك نظيف تماماً.</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowNukeModal(true)}
                                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30"
                                        >
                                            <Trash2 size={18} /> مسح جميع بياناتي نهائياً
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>

        {/* ===== Nuke Confirmation Modal ===== */}
        {showNukeModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" dir="rtl">
                <div className="bg-slate-950 border-2 border-red-500/40 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl shadow-red-900/20">
                    <button onClick={closeNuke} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">
                        <X size={28} />
                    </button>

                    {/* Step 1: Warning */}
                    {nukeStep === 1 && (
                        <div className="text-right">
                            <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Zap size={40} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-black text-red-400 text-center mb-4">⚠️ تحذير أخير</h2>
                            <p className="text-slate-300 text-sm text-center leading-relaxed mb-4">
                                أنت على وشك حذف <span className="text-red-400 font-black">جميع بياناتك المالية</span> بشكل نهائي:
                            </p>
                            <div className="bg-red-950/50 p-4 rounded-2xl border border-red-500/20 mb-8 space-y-2">
                                {['جميع المصروفات والمدخولات', 'جميع القروض والأقساط', 'جميع البطاقات والجمعيات', 'جميع الشهادات الاستثمارية', 'جميع الحسابات والميزانيات', 'جميع السلف والديون'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-red-300 text-sm">
                                        <span className="text-red-500">✗</span> {item}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={closeNuke} className="py-4 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 transition-all">إلغاء</button>
                                <button onClick={() => setNukeStep(2)} className="py-4 bg-red-700 text-white rounded-2xl font-black hover:bg-red-600 transition-all">متابعة ←</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Type confirmation */}
                    {nukeStep === 2 && (
                        <div className="text-right">
                            <h2 className="text-xl font-black text-red-400 mb-2">تأكيد نهائي</h2>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                لتأكيد الحذف، اكتب بالضبط:<br />
                                <span className="text-white font-black bg-red-900/30 px-3 py-1.5 rounded-lg mt-2 inline-block text-base tracking-wide">
                                    احذف كل البيانات
                                </span>
                            </p>
                            <input
                                type="text"
                                placeholder="اكتب الجملة أعلاه..."
                                className="w-full bg-slate-900 border-2 border-red-500/30 focus:border-red-500 text-white p-5 rounded-2xl font-bold outline-none transition-all mb-6 text-center"
                                value={nukeConfirmText}
                                onChange={e => setNukeConfirmText(e.target.value)}
                                autoFocus
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setNukeStep(1)} className="py-4 bg-slate-800 text-slate-300 rounded-2xl font-black hover:bg-slate-700 transition-all">→ رجوع</button>
                                <button
                                    onClick={handleNuke}
                                    disabled={nukeConfirmText !== 'احذف كل البيانات' || nukeLoading}
                                    className={`py-4 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                                        nukeConfirmText === 'احذف كل البيانات' && !nukeLoading
                                            ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/30'
                                            : 'bg-slate-700 opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    {nukeLoading
                                        ? <RefreshCw size={18} className="animate-spin" />
                                        : <><Trash2 size={18} /> احذف نهائياً</>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default Settings;
