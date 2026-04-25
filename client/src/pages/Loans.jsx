import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Banknote, Plus, Trash2, Calendar, Landmark, Edit2, X } from 'lucide-react';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [form, setForm] = useState({
        loanName: '', lenderName: '', principalAmount: '', durationMonths: '', monthlyInstallment: '', totalPayable: '', startDate: '', firstDueDate: '', dueDay: 1
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchLoans(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/loans/${editingId}`, form);
                setEditingId(null);
            } else {
                await api.post('/loans', form);
            }
            setForm({ loanName: '', lenderName: '', principalAmount: '', durationMonths: '', monthlyInstallment: '', totalPayable: '', startDate: '', firstDueDate: '', dueDay: 1 });
            fetchLoans();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (loan) => {
        setEditingId(loan._id);
        setForm({
            loanName: loan.loanName,
            lenderName: loan.lenderName,
            principalAmount: loan.principalAmount,
            durationMonths: loan.durationMonths,
            monthlyInstallment: loan.monthlyInstallment,
            totalPayable: loan.totalPayable,
            startDate: loan.startDate.split('T')[0],
            firstDueDate: loan.firstDueDate.split('T')[0],
            dueDay: loan.dueDay
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/loans/${id}`);
            fetchLoans();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة القروض</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editingId ? <Edit2 className="text-indigo-400" /> : <Plus className="text-blue-500" />}
                            {editingId ? 'تعديل القرض' : 'تسجيل قرض جديد'}
                        </h3>
                        {editingId && (
                            <button onClick={() => {setEditingId(null); setForm({loanName:'', lenderName:'', principalAmount:'', durationMonths:'', monthlyInstallment:'', totalPayable:'', startDate:'', firstDueDate:'', dueDay:1});}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم القرض" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.loanName} onChange={e => setForm({...form, loanName: e.target.value})} required />
                        <input placeholder="جهة القرض" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.lenderName} onChange={e => setForm({...form, lenderName: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="المبلغ الأصلي" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.principalAmount} onChange={e => setForm({...form, principalAmount: e.target.value})} required />
                            <input type="number" placeholder="إجمالي الرد" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.totalPayable} onChange={e => setForm({...form, totalPayable: e.target.value})} required />
                        </div>
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl shadow-lg ${editingId ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'حفظ القرض')}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {loans.map((loan) => (
                        <div key={loan._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center"><Landmark size={24} /></div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{loan.loanName}</h4>
                                        <p className="text-slate-500 text-sm">{loan.lenderName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(loan)} className="text-slate-500 hover:text-blue-400"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(loan._id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Loans;
