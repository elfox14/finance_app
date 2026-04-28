import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Edit2, Wallet, Landmark, 
    Smartphone, PiggyBank, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownLeft, BarChart3,
    CheckCircle2, X, RefreshCw, Coins, CreditCard,
    DollarSign, Settings2, Save, FileCheck, ShieldAlert
} from 'lucide-react';

const accountTypeConfig = {
    'نقدي':              { icon: Coins,       color: 'bg-emerald-600', light: 'bg-emerald-600/10 text-emerald-500', border: 'border-emerald-500/30' },
    'بنكي':              { icon: Landmark,    color: 'bg-blue-600',    light: 'bg-blue-600/10 text-blue-500',       border: 'border-blue-500/30'    },
    'محفظة_إلكترونية':  { icon: Smartphone,  color: 'bg-purple-600',  light: 'bg-purple-600/10 text-purple-500',   border: 'border-purple-500/30'  },
    'توفير':             { icon: PiggyBank,   color: 'bg-amber-600',   light: 'bg-amber-600/10 text-amber-500',     border: 'border-amber-500/30'   },
    'استثمار':           { icon: TrendingUp,  color: 'bg-rose-600',    light: 'bg-rose-600/10 text-rose-500',       border: 'border-rose-500/30'    },
};

const ACCOUNT_TYPES = Object.keys(accountTypeConfig);

const Accounts = () => {
    const [accounts, setAccounts]     = useState([]);
    const [totalLedgerBalance, setTotalLedger] = useState(0);
    const [totalStatementBalance, setTotalStatement] = useState(0);
    const [loading, setLoading]       = useState(true);
    
    // Modals
    const [showAddModal, setShowAdd]  = useState(false);
    const [showReconcile, setShowReconcile] = useState(null); // account object
    const [editMode, setEditMode]     = useState(null);  // account id

    const [form, setForm] = useState({
        name: '', type: 'بنكي', bankName: '', openingBalance: '',
        accountNumber: '', currency: 'EGP', isSalaryAccount: false, notes: ''
    });

    const [reconcileForm, setReconcileForm] = useState({ statementBalance: '', reconciliationDate: new Date().toISOString().slice(0, 10) });

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/accounts');
            setAccounts(res.data.accounts || []);
            setTotalLedger(res.data.totalBalance || 0);
            setTotalStatement(res.data.totalStatementBalance || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/accounts/${editMode}`, form);
                setEditMode(null);
            } else {
                await api.post('/accounts', form);
            }
            setShowAdd(false);
            setForm({ name: '', type: 'بنكي', bankName: '', openingBalance: '', accountNumber: '', currency: 'EGP', isSalaryAccount: false, notes: '' });
            fetchAccounts();
        } catch (err) { alert('خطأ في حفظ الحساب'); }
    };

    const handleReconcile = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/accounts/${showReconcile._id}/reconcile`, reconcileForm);
            setShowReconcile(null);
            setReconcileForm({ statementBalance: '', reconciliationDate: new Date().toISOString().slice(0, 10) });
            fetchAccounts();
        } catch (err) { alert('خطأ في التسوية البنكية'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من إغلاق/حذف هذا الحساب؟')) return;
        try {
            await api.delete(`/accounts/${id}`);
            fetchAccounts();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    const openEdit = (acc) => {
        setForm({
            name: acc.name, type: acc.type, bankName: acc.bankName || '',
            openingBalance: acc.openingBalance || 0, accountNumber: acc.accountNumber || '',
            currency: acc.currency || 'EGP', isSalaryAccount: acc.isSalaryAccount || false, notes: acc.notes || ''
        });
        setEditMode(acc._id);
        setShowAdd(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    const totalDifference = totalStatementBalance - totalLedgerBalance;

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* ===== Header ===== */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">
                        الحسابات والبنوك
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-2">
                        تعريف الحسابات النقدية ومطابقتها مع كشوفات البنوك
                    </p>
                </div>
                <button
                    onClick={() => { setEditMode(null); setForm({ name: '', type: 'بنكي', bankName: '', openingBalance: '', accountNumber: '', currency: 'EGP', isSalaryAccount: false, notes: '' }); setShowAdd(true); }}
                    className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all"
                >
                    <Plus size={20} /> إضافة حساب بنكي
                </button>
            </header>

            {/* ===== KPIs Section ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full"></div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">إجمالي الرصيد الدفتري</p>
                    <p className="text-4xl font-black text-white">{totalLedgerBalance.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                    <p className="text-xs text-slate-500 mt-2">ناتج من حركات التطبيق (Ledger Balance)</p>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full"></div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2">الرصيد حسب كشوف البنك</p>
                    <p className="text-4xl font-black text-emerald-400">{totalStatementBalance.toLocaleString()} <span className="text-sm opacity-50">ج.م</span></p>
                    <p className="text-xs text-slate-500 mt-2">ناتج من آخر تسوية (Statement Balance)</p>
                </div>

                <div className={`border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden ${totalDifference === 0 ? 'bg-slate-900 border-slate-800' : 'bg-red-900/10 border-red-500/30'}`}>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">فروقات غير مسوّاة</p>
                    <p className={`text-4xl font-black ${totalDifference === 0 ? 'text-slate-300' : 'text-red-400'}`}>
                        {Math.abs(totalDifference).toLocaleString()} <span className="text-sm opacity-50">ج.م</span>
                    </p>
                    <p className={`text-xs mt-2 ${totalDifference === 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {totalDifference === 0 ? 'متطابق بالكامل' : (totalDifference > 0 ? 'البنك أعلى من الدفتر' : 'الدفتر أعلى من البنك')}
                    </p>
                </div>
            </div>

            {/* ===== Accounts Grid ===== */}
            {accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900 border-2 border-slate-800 border-dashed rounded-[3rem] mx-4 md:mx-0">
                    <Landmark size={64} className="text-slate-700 mb-6" />
                    <p className="text-white font-black text-xl mb-2">لا توجد حسابات بنكية مسجلة</p>
                    <p className="text-slate-500 text-sm">أضف حسابك لتسجيل التدفقات النقدية والرواتب</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-0">
                    {accounts.map(acc => {
                        const cfg = accountTypeConfig[acc.type] || accountTypeConfig['نقدي'];
                        const IconComp = cfg.icon;
                        const analytics = acc.analytics || {};
                        const isReconciled = analytics.difference === 0;

                        return (
                            <div 
                                key={acc._id}
                                className={`group relative bg-slate-900 border ${isReconciled ? cfg.border : 'border-orange-500/50'} rounded-[2.5rem] p-8 shadow-2xl transition-all overflow-hidden`}
                            >
                                {/* Actions */}
                                <div className="absolute top-6 left-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(acc)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                                        <Edit2 size={15} />
                                    </button>
                                    <button onClick={() => handleDelete(acc._id)} className="p-2 bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                {/* Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-14 h-14 ${cfg.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <IconComp size={26} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                                            {acc.name}
                                            {!isReconciled && <ShieldAlert size={14} className="text-orange-500" title="يوجد فرق بين الدفتر والبنك" />}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                            {acc.bankName || acc.type} {acc.accountNumber && `• ${acc.accountNumber}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Balances */}
                                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">الرصيد الدفتري</p>
                                        <p className="text-lg font-black text-white">{(analytics.ledgerBalance || 0).toLocaleString()} <span className="text-[9px] opacity-50">ج.م</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">الرصيد البنكي</p>
                                        <p className="text-lg font-black text-emerald-400">{(analytics.statementBalance || 0).toLocaleString()} <span className="text-[9px] opacity-50">ج.م</span></p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-slate-800/30 p-3 rounded-2xl">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">عمليات غير مسوّاة</p>
                                        <p className="text-sm font-black text-slate-300">{analytics.unReconciledCount || 0} حركة</p>
                                    </div>
                                    <div className="bg-slate-800/30 p-3 rounded-2xl">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">تحويلات معلقة (وارد)</p>
                                        <p className="text-sm font-black text-blue-400">{(analytics.pendingTransfers || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Reconcile Button */}
                                <button
                                    onClick={() => { setShowReconcile(acc); setReconcileForm({ statementBalance: acc.statementBalance || 0, reconciliationDate: new Date().toISOString().slice(0, 10) }); }}
                                    className={`w-full py-4 ${isReconciled ? 'bg-slate-800 text-slate-400' : 'bg-orange-600/20 text-orange-500 border-orange-500/30 border'} rounded-2xl font-black transition-all hover:bg-slate-700 hover:text-white flex items-center justify-center gap-2 text-sm`}
                                >
                                    <FileCheck size={18} /> {isReconciled ? 'مطابقة ومراجعة البنك' : 'تسوية الفروقات البنكية'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== Add/Edit Account Modal ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-blue-500/30 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAdd(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">
                            <X size={32} />
                        </button>
                        <h2 className="text-3xl font-black text-white mb-2 italic flex items-center gap-3">
                            <Landmark className="text-blue-500" />
                            {editMode ? 'تعديل بيانات الحساب' : 'تعريف حساب بنكي جديد'}
                        </h2>
                        <p className="text-slate-500 text-sm mb-8">تسجيل الرصيد الافتتاحي وبدء توجيه العمليات المالية من الدفتر الموحد.</p>
                        
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">الرصيد الافتتاحي</label>
                                    <input type="number" required placeholder="0.00" disabled={editMode} title={editMode ? "لا يمكن تعديل الافتتاحي بعد الإنشاء" : ""} className={`w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] font-black text-2xl outline-none focus:border-blue-500 transition-all text-center ${editMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        value={form.openingBalance} onChange={e => setForm({ ...form, openingBalance: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">اسم الحساب (اللقب)</label>
                                    <input required placeholder="مثال: حساب الراتب، الكاشير..." className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-[2rem] font-bold outline-none focus:border-blue-500 transition-all"
                                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">اسم البنك / المنصة</label>
                                    <input placeholder="البنك الأهلي، انستا باي..." className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500"
                                        value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-bold uppercase">آخر 4 أرقام من الحساب</label>
                                    <input type="text" maxLength={4} placeholder="1234" className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500 text-center tracking-widest"
                                        value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">نوع الحساب</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {ACCOUNT_TYPES.map(type => {
                                        const cfg = accountTypeConfig[type];
                                        const Icon = cfg.icon;
                                        return (
                                            <button key={type} type="button" onClick={() => setForm({ ...form, type })}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${form.type === type ? `${cfg.color} border-transparent text-white shadow-lg` : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800'}`}>
                                                <Icon size={18} />
                                                <span className="text-[10px] font-black">{type.replace('_', ' ')}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-5 bg-slate-900 rounded-2xl border border-slate-800">
                                <input type="checkbox" id="isSalary" className="w-5 h-5 accent-blue-500" 
                                    checked={form.isSalaryAccount} onChange={e => setForm({...form, isSalaryAccount: e.target.checked})} />
                                <label htmlFor="isSalary" className="text-sm font-bold text-white cursor-pointer">هذا الحساب مخصص لاستلام الرواتب الأساسية</label>
                            </div>

                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-3">
                                <Save size={24} /> {editMode ? 'حفظ التعديلات' : 'تعريف الحساب واعتماد الرصيد'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Bank Reconciliation Modal ===== */}
            {showReconcile && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-emerald-500/30 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowReconcile(null)} className="absolute top-8 left-8 text-slate-500 hover:text-white"><X size={28} /></button>
                        <h2 className="text-2xl font-black text-white mb-2 italic">التسوية البنكية</h2>
                        <p className="text-slate-400 text-sm mb-8">{showReconcile.name} - {showReconcile.bankName}</p>

                        <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">الرصيد الدفتري للنظام</p>
                                <p className="text-xl font-black text-white">{(showReconcile.analytics?.ledgerBalance || 0).toLocaleString()} ج.م</p>
                            </div>
                            <ShieldAlert size={28} className="text-slate-700" />
                        </div>

                        <form onSubmit={handleReconcile} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] text-emerald-500 font-bold uppercase">رصيد كشف الحساب البنكي</label>
                                <input type="number" required placeholder="0.00" className="w-full bg-slate-900 border border-emerald-500/30 text-emerald-400 p-6 rounded-[2rem] font-black text-3xl text-center outline-none focus:border-emerald-500 transition-all"
                                    value={reconcileForm.statementBalance} onChange={e => setReconcileForm({ ...reconcileForm, statementBalance: e.target.value })} />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">تاريخ كشف الحساب</label>
                                <input type="date" required className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-emerald-500"
                                    value={reconcileForm.reconciliationDate} onChange={e => setReconcileForm({ ...reconcileForm, reconciliationDate: e.target.value })} />
                            </div>

                            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/30 transition-all">
                                اعتماد كشف الحساب
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
