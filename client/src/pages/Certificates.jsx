import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileBadge, Plus, Trash2, Calendar, Landmark, Edit2, X, TrendingUp } from 'lucide-react';

const Certificates = () => {
    const [certs, setCerts] = useState([]);
    const [form, setForm] = useState({
        bankName: '', certificateType: '', principalAmount: '', interestRate: '', durationMonths: '', startDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchCerts = async () => {
        try {
            const res = await api.get('/certificates');
            setCerts(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchCerts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/certificates/${editingId}`, form);
                setEditingId(null);
            } else {
                await api.post('/certificates', form);
            }
            setForm({ bankName: '', certificateType: '', principalAmount: '', interestRate: '', durationMonths: '', startDate: '' });
            fetchCerts();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (cert) => {
        setEditingId(cert._id);
        setForm({
            bankName: cert.bankName,
            certificateType: cert.certificateType,
            principalAmount: cert.principalAmount,
            interestRate: cert.interestRate,
            durationMonths: cert.durationMonths,
            startDate: cert.startDate?.split('T')[0] || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/certificates/${id}`);
            fetchCerts();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة الشهادات الادخارية</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editingId ? <Edit2 className="text-indigo-400" /> : <FileBadge className="text-blue-500" />}
                            {editingId ? 'تعديل الشهادة' : 'إضافة شهادة جديدة'}
                        </h3>
                        {editingId && (
                            <button onClick={() => {setEditingId(null); setForm({bankName:'', certificateType:'', principalAmount:'', interestRate:'', durationMonths:'', startDate:''});}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم البنك" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} required />
                        <input placeholder="نوع الشهادة" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.certificateType} onChange={e => setForm({...form, certificateType: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="المبلغ" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.principalAmount} onChange={e => setForm({...form, principalAmount: e.target.value})} required />
                            <input type="number" placeholder="الفائدة %" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.interestRate} onChange={e => setForm({...form, interestRate: e.target.value})} required />
                        </div>
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl shadow-lg ${editingId ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث الشهادة' : 'حفظ الشهادة')}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certs.map((cert) => (
                        <div key={cert._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                        <FileBadge size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{cert.certificateType}</h4>
                                        <p className="text-slate-500 text-sm">{cert.bankName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cert)} className="text-slate-500 hover:text-blue-400"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(cert._id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-800 pt-4">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">المبلغ المودع</p>
                                    <p className="text-xl font-bold text-emerald-400">{cert.principalAmount.toLocaleString()} ج.م</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs mb-1">الفائدة</p>
                                    <p className="text-lg font-bold text-blue-400">{cert.interestRate}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Certificates;
