import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Banknote, Plus, Trash2, Calendar, Landmark } from 'lucide-react';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [form, setForm] = useState({
        loanName: '',
        lenderName: '',
        principalAmount: '',
        durationMonths: '',
        monthlyInstallment: '',
        totalPayable: '',
        startDate: '',
        firstDueDate: '',
        dueDay: 1
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchLoans = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/loans`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setLoans(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/loans`, 
                form,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setForm({ loanName: '', lenderName: '', principalAmount: '', durationMonths: '', monthlyInstallment: '', totalPayable: '', startDate: '', firstDueDate: '', dueDay: 1 });
            fetchLoans();
        } catch (err) {
            alert('حدث خطأ أثناء إضافة القرض');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا القرض؟')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/loans/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchLoans();
        } catch (err) {
            alert('خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة القروض والديون</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Plus className="text-red-500" /> تسجيل قرض جديد
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            placeholder="اسم القرض (مثلاً: قرض سيارة)"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                            value={form.loanName}
                            onChange={(e) => setForm({...form, loanName: e.target.value})}
                            required
                        />
                        <input 
                            placeholder="جهة القرض (اسم البنك / الشخص)"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                            value={form.lenderName}
                            onChange={(e) => setForm({...form, lenderName: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="number" placeholder="المبلغ الأصلي"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={form.principalAmount}
                                onChange={(e) => setForm({...form, principalAmount: e.target.value})}
                                required
                            />
                            <input 
                                type="number" placeholder="إجمالي الرد"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={form.totalPayable}
                                onChange={(e) => setForm({...form, totalPayable: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="number" placeholder="القسط الشهري"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={form.monthlyInstallment}
                                onChange={(e) => setForm({...form, monthlyInstallment: e.target.value})}
                                required
                            />
                            <input 
                                type="number" placeholder="المدة بالشهور"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={form.durationMonths}
                                onChange={(e) => setForm({...form, durationMonths: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">تاريخ البدء</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm"
                                    value={form.startDate}
                                    onChange={(e) => setForm({...form, startDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">أول استحقاق</label>
                                <input 
                                    type="date"
                                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm"
                                    value={form.firstDueDate}
                                    onChange={(e) => setForm({...form, firstDueDate: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/20"
                        >
                            {loading ? 'جاري الحفظ...' : 'تسجيل القرض'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {loans.length > 0 ? (
                        loans.map((loan) => (
                            <div key={loan._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-red-500/30 transition-all group">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-5">
                                        <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
                                            <Landmark size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">{loan.loanName}</h4>
                                            <p className="text-slate-500 text-sm">{loan.lenderName}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-10">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">المتبقي</p>
                                            <p className="text-lg font-bold text-white">{loan.remainingAmount.toLocaleString()} <span className="text-xs">ج.م</span></p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">القسط</p>
                                            <p className="text-lg font-bold text-white">{loan.monthlyInstallment.toLocaleString()} <span className="text-xs">ج.م</span></p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">تاريخ الدفع</p>
                                            <p className="text-lg font-bold text-white flex items-center justify-center gap-1"><Calendar size={14} /> {loan.dueDay}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                                    <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-red-500 h-full" 
                                            style={{ width: `${(loan.paidAmount / loan.totalPayable) * 100}%` }}
                                        ></div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(loan._id)}
                                        className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                            <Banknote size={48} className="mx-auto mb-4 opacity-20" />
                            <p>لا توجد قروض مسجلة حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Loans;
