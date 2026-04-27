import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Edit2, Wallet, Landmark, 
    Smartphone, PiggyBank, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownLeft, BarChart3,
    CheckCircle2, X, RefreshCw, Coins, CreditCard,
    DollarSign, Settings2, Save
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
    const [totalBalance, setTotal]    = useState(0);
    const [loading, setLoading]       = useState(true);
    const [showAddModal, setShowAdd]  = useState(false);
    const [showAdjust, setShowAdjust] = useState(null); // account object
    const [editMode, setEditMode]     = useState(null);  // account id

    const [form, setForm] = useState({
        name: '', type: 'نقدي', bankName: '', balance: '',
        accountNumber: '', currency: 'EGP', notes: ''
    });

    const [adjustForm, setAdjustForm] = useState({ amount: '', type: 'deposit', note: '' });

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/accounts');
            setAccounts(res.data.accounts || []);
            setTotal(res.data.totalBalance || 0);
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
            setForm({ name: '', type: 'نقدي', bankName: '', balance: '', accountNumber: '', currency: 'EGP', notes: '' });
            fetchAccounts();
        } catch (err) { alert('خطأ في حفظ الحساب'); }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/accounts/${showAdjust._id}/adjust`, adjustForm);
            setShowAdjust(null);
            setAdjustForm({ amount: '', type: 'deposit', note: '' });
            fetchAccounts();
        } catch (err) { alert('خطأ في تعديل الرصيد'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
        try {
            await api.delete(`/accounts/${id}`);
            fetchAccounts();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    const openEdit = (acc) => {
        setForm({
            name: acc.name, type: acc.type, bankName: acc.bankName || '',
            balance: acc.balance, accountNumber: acc.accountNumber || '',
            currency: acc.currency || 'EGP', notes: acc.notes || ''
        });
        setEditMode(acc._id);
        setShowAdd(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="space-y-10 fade-in pb-24 md:pb-10" dir="rtl">
            {/* ===== Header ===== */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white italic">
                        إدارة الحسابات والمحافظ
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-1">
                        تتبع رصيدك عبر جميع حساباتك البنكية والنقدية والمحافظ الإلكترونية
                    </p>
                </div>
                <button
                    onClick={() => { setEditMode(null); setForm({ name: '', type: 'نقدي', bankName: '', balance: '', accountNumber: '', currency: 'EGP', notes: '' }); setShowAdd(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} /> إضافة حساب جديد
                </button>
            </header>

            {/* ===== Total Balance Card ===== */}
            <div className="mx-4 md:mx-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-blue-500/30 p-8 md:p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                    <p className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-2">إجمالي الثروة الصافية</p>
                    <p className="text-4xl md:text-6xl font-black text-white">
                        {totalBalance.toLocaleString()}
                        <span className="text-lg opacity-50 mr-2">ج.م</span>
                    </p>
                    <p className="text-blue-200/70 text-sm mt-3">{accounts.length} حساب مسجل</p>
                </div>
            </div>

            {/* ===== Accounts Grid ===== */}
            {accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-[3rem] mx-4 md:mx-0">
                    <Wallet size={64} className="text-slate-700 mb-4" />
                    <p className="text-slate-500 font-bold text-lg">لا توجد حسابات مسجلة بعد</p>
                    <p className="text-slate-600 text-sm mt-2">ابدأ بإضافة حسابك النقدي أو البنكي</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-0">
                    {accounts.map(acc => {
                        const cfg = accountTypeConfig[acc.type] || accountTypeConfig['نقدي'];
                        const IconComp = cfg.icon;
                        const analytics = acc.analytics || {};
                        return (
                            <div 
                                key={acc._id}
                                className={`group relative bg-slate-900 border ${cfg.border} rounded-[2.5rem] p-8 shadow-2xl hover:scale-[1.01] transition-all overflow-hidden`}
                            >
                                {/* Background Glow */}
                                <div className={`absolute -top-10 -left-10 w-40 h-40 ${cfg.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>

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
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 ${cfg.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <IconComp size={26} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">{acc.name}</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                            {acc.bankName || acc.type}
                                        </p>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div className="mb-6">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">الرصيد الحالي</p>
                                    <p className={`text-3xl font-black ${acc.balance >= 0 ? 'text-white' : 'text-red-500'}`}>
                                        {acc.balance.toLocaleString()}
                                        <span className="text-xs opacity-40 mr-1">ج.م</span>
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl">
                                        <div className="flex items-center gap-1 mb-1">
                                            <ArrowDownLeft size={12} className="text-emerald-500" />
                                            <p className="text-[9px] text-emerald-500 font-bold uppercase">وارد</p>
                                        </div>
                                        <p className="text-sm font-black text-emerald-400">{(analytics.totalIn || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-2xl">
                                        <div className="flex items-center gap-1 mb-1">
                                            <ArrowUpRight size={12} className="text-red-400" />
                                            <p className="text-[9px] text-red-400 font-bold uppercase">صادر</p>
                                        </div>
                                        <p className="text-sm font-black text-red-400">{(analytics.totalOut || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Account Number */}
                                {acc.accountNumber && (
                                    <p className="text-[10px] text-slate-600 font-bold mb-4 tracking-widest">
                                        •••• •••• •••• {acc.accountNumber}
                                    </p>
                                )}

                                {/* Adjust Button */}
                                <button
                                    onClick={() => { setShowAdjust(acc); setAdjustForm({ amount: '', type: 'deposit', note: '' }); }}
                                    className={`w-full py-4 ${cfg.color} text-white rounded-2xl font-black transition-all hover:opacity-90 shadow-lg flex items-center justify-center gap-2 text-sm`}
                                >
                                    <RefreshCw size={16} /> تعديل الرصيد
                                </button>
                            </div>
                        );
                    })}

                    {/* Add New Account Mini Card */}
                    <button
                        onClick={() => { setEditMode(null); setForm({ name: '', type: 'نقدي', bankName: '', balance: '', accountNumber: '', currency: 'EGP', notes: '' }); setShowAdd(true); }}
                        className="group border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 transition-all hover:bg-blue-500/5"
                    >
                        <div className="w-16 h-16 bg-slate-800 group-hover:bg-blue-600/20 rounded-2xl flex items-center justify-center transition-all">
                            <Plus size={28} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <p className="text-slate-600 group-hover:text-slate-400 font-bold text-sm transition-colors">إضافة حساب جديد</p>
                    </button>
                </div>
            )}

            {/* ===== Account Summary Section ===== */}
            {accounts.length > 0 && (
                <div className="mx-4 md:mx-0 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="text-blue-500" /> توزيع الثروة بالحسابات
                    </h3>
                    <div className="space-y-4">
                        {accounts.map(acc => {
                            const cfg = accountTypeConfig[acc.type] || accountTypeConfig['نقدي'];
                            const percent = totalBalance > 0 ? Math.max(0, (acc.balance / totalBalance) * 100) : 0;
                            return (
                                <div key={acc._id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">{acc.name}</span>
                                        <span className="text-sm font-black text-slate-400">
                                            {acc.balance.toLocaleString()} ج.م
                                            <span className="text-[10px] text-slate-600 mr-2">({percent.toFixed(1)}%)</span>
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${cfg.color} transition-all duration-1000 rounded-full`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== Add/Edit Account Modal ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setShowAdd(false)} className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors">
                            <X size={28} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 italic flex items-center gap-3">
                            <Wallet className="text-blue-500" />
                            {editMode ? 'تعديل الحساب' : 'إضافة حساب جديد'}
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">اسم الحساب</label>
                                <input
                                    required
                                    placeholder="مثال: الراتب، محفظة إنستا، حساب التوفير..."
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">نوع الحساب</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ACCOUNT_TYPES.map(type => {
                                        const cfg = accountTypeConfig[type];
                                        const Icon = cfg.icon;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setForm({ ...form, type })}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${form.type === type ? `${cfg.color} border-transparent text-white shadow-lg` : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
                                            >
                                                <Icon size={18} />
                                                <span className="text-[9px] font-black">{type.replace('_', ' ')}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {(form.type === 'بنكي' || form.type === 'توفير' || form.type === 'استثمار') && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase">اسم البنك / المؤسسة</label>
                                    <input
                                        placeholder="بنك مصر، CIB، فوري..."
                                        className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
                                        value={form.bankName}
                                        onChange={e => setForm({ ...form, bankName: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase">الرصيد الافتتاحي</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-black text-xl outline-none focus:border-blue-500 transition-all"
                                        value={form.balance}
                                        onChange={e => setForm({ ...form, balance: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase">آخر 4 أرقام</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="مثال: 1234"
                                        className="w-full bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
                                        value={form.accountNumber}
                                        onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                                <Save size={20} />
                                {editMode ? 'حفظ التعديلات' : 'إضافة الحساب'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Balance Adjustment Modal ===== */}
            {showAdjust && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-sm rounded-[3rem] p-10 relative shadow-2xl text-right">
                        <button onClick={() => setShowAdjust(null)} className="absolute top-8 left-8 text-slate-500 hover:text-white">
                            <X size={28} />
                        </button>
                        <h2 className="text-xl font-black text-white mb-2 italic">{showAdjust.name}</h2>
                        <p className="text-slate-500 text-sm mb-8">الرصيد الحالي: <span className="text-white font-black">{showAdjust.balance?.toLocaleString()} ج.م</span></p>

                        <form onSubmit={handleAdjust} className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAdjustForm({ ...adjustForm, type: 'deposit' })}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all text-sm ${adjustForm.type === 'deposit' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}
                                >
                                    <ArrowDownLeft size={18} /> إيداع
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustForm({ ...adjustForm, type: 'withdraw' })}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black transition-all text-sm ${adjustForm.type === 'withdraw' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}
                                >
                                    <ArrowUpRight size={18} /> سحب
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase">المبلغ</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl font-black text-3xl text-center outline-none focus:border-blue-500 transition-all"
                                    value={adjustForm.amount}
                                    onChange={e => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-5 text-white rounded-[2rem] font-black text-lg shadow-xl transition-all ${adjustForm.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}
                            >
                                {adjustForm.type === 'deposit' ? 'تأكيد الإيداع' : 'تأكيد السحب'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
