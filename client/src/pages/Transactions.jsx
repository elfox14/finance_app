import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Filter, MoreHorizontal, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, CheckCircle, AlertCircle, FileText, Upload } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [form, setForm] = useState({
        type: 'مصروف', amount: '', accountId: '', destinationAccountId: '', 
        category: '', subCategory: '', counterparty: '', date: new Date().toISOString().slice(0, 10),
        reference: '', notes: '', status: 'مُرحَّل'
    });

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
            const accRes = await api.get('/accounts');
            setAccounts(accRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.amount <= 0) return alert('المبلغ غير صالح');
        try {
            await api.post('/transactions', form);
            setForm({ ...form, amount: '', notes: '', reference: '', subCategory: '', counterparty: '' });
            fetchTransactions();
        } catch (err) {
            alert(err.response?.data?.message || 'خطأ في الحفظ');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/transactions/${id}/status`, { status });
            fetchTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    const getTypeIcon = (type) => {
        if (type === 'دخل') return <ArrowDownLeft className="text-emerald-500" />;
        if (type === 'مصروف') return <ArrowUpRight className="text-red-500" />;
        if (type === 'تحويل') return <ArrowRightLeft className="text-blue-500" />;
        return <FileText className="text-slate-500" />;
    };

    const getStatusBadge = (status) => {
        const styles = {
            'غير مصنف': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            'مصنف': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'مُرحَّل': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            'مُسوّى': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        };
        return <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="space-y-8 fade-in pb-24 md:pb-10" dir="rtl">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">العمليات المالية <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded">الدفتر الموحد</span></h1>
                    <p className="text-slate-400 text-sm mt-1">مركز إدخال وتوجيه الحركات الموحد.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition">
                        <Upload size={16} /> استيراد كشف
                    </button>
                </div>
            </header>

            {/* Input Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-white flex items-center gap-2"><Plus className="text-blue-500"/> عملية جديدة</h2>
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-blue-500 font-bold hover:underline">
                        {showAdvanced ? 'إخفاء الحقول المتقدمة' : 'إظهار الحقول المتقدمة'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold">النوع</label>
                            <select name="type" value={form.type} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition">
                                <option value="مصروف">مصروف (Expense)</option>
                                <option value="دخل">دخل (Income)</option>
                                <option value="تحويل">تحويل (Transfer)</option>
                                <option value="سداد">سداد (Payment)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold">المبلغ</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold">الحساب (المصدر)</label>
                            <select name="accountId" value={form.accountId} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none">
                                <option value="">اختر الحساب...</option>
                                {accounts.map(a => <option key={a._id} value={a._id}>{a.name} ({a.balance} ج.م)</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold">الفئة الرئيسية</label>
                            <input type="text" name="category" value={form.category} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" placeholder="مثال: طعام، رواتب..." />
                        </div>
                    </div>

                    {form.type === 'تحويل' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2 md:col-start-3">
                                <label className="text-xs text-slate-400 font-bold">الحساب (الوجهة)</label>
                                <select name="destinationAccountId" value={form.destinationAccountId} onChange={handleChange} required={form.type === 'تحويل'} className="w-full bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl px-4 py-3 focus:border-emerald-500 outline-none">
                                    <option value="">اختر حساب الوجهة...</option>
                                    {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {showAdvanced && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/50">
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-bold">التاريخ</label>
                                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-bold">الطرف المقابل</label>
                                <input type="text" name="counterparty" value={form.counterparty} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" placeholder="مورد، عميل، شركة..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-bold">الرقم المرجعي</label>
                                <input type="text" name="reference" value={form.reference} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" placeholder="رقم فاتورة أو إيصال..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400 font-bold">الحالة المبدئية</label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none">
                                    <option value="غير مصنف">غير مصنف</option>
                                    <option value="مصنف">مصنف</option>
                                    <option value="مُرحَّل">مُرحَّل (يؤثر على اللوحة)</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-4">
                                <label className="text-xs text-slate-400 font-bold">ملاحظات</label>
                                <input type="text" name="notes" value={form.notes} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                            حفظ العملية
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-white">أحدث الحركات المالية</h2>
                    <div className="flex gap-2">
                        <button className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white"><Filter size={18}/></button>
                    </div>
                </div>

                {loading ? <div className="text-center py-10 text-slate-500">جاري التحميل...</div> : 
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="text-slate-500 border-b border-slate-800">
                                <tr>
                                    <th className="py-4 font-bold">التاريخ</th>
                                    <th className="py-4 font-bold">النوع</th>
                                    <th className="py-4 font-bold">الحساب</th>
                                    <th className="py-4 font-bold">الفئة</th>
                                    <th className="py-4 font-bold">المبلغ</th>
                                    <th className="py-4 font-bold">الحالة</th>
                                    <th className="py-4 font-bold">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-4 text-slate-300">{new Date(tx.date).toLocaleDateString('ar-EG')}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                {getTypeIcon(tx.type)}
                                                <span>{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-300 text-xs">
                                            {tx.accountId?.name} 
                                            {tx.destinationAccountId && <span className="text-slate-500 mx-1">→ {tx.destinationAccountId.name}</span>}
                                        </td>
                                        <td className="py-4 text-slate-300 font-bold">{tx.category}</td>
                                        <td className="py-4 font-black text-white">{tx.amount.toLocaleString()} <span className="text-xs text-slate-500">{tx.currency}</span></td>
                                        <td className="py-4">{getStatusBadge(tx.status)}</td>
                                        <td className="py-4">
                                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {tx.status !== 'مُرحَّل' && tx.status !== 'مُسوّى' && (
                                                    <button onClick={() => updateStatus(tx._id, 'مُرحَّل')} className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded" title="ترحيل (Approve)">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button className="text-slate-400 hover:text-white p-1 rounded"><MoreHorizontal size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr><td colSpan="7" className="text-center py-10 text-slate-500 font-bold">لا توجد عمليات مسجلة</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        </div>
    );
};

export default Transactions;
