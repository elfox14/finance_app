import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, FileBadge, Calendar, 
    ArrowUpCircle, Percent, AlertCircle, 
    ChevronRight, X, LayoutGrid, Receipt, Edit2, Landmark
} from 'lucide-react';

const Certificates = () => {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ 
        bankName: '', 
        amount: '', 
        interestRate: '', 
        durationMonths: '', 
        purchaseDate: new Date().toISOString().split('T')[0],
        payoutType: 'monthly' 
    });

    const fetchCerts = async () => {
        try {
            const res = await api.get('/certificates');
            setCerts(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCerts(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/certificates', form);
            setForm({ bankName: '', amount: '', interestRate: '', durationMonths: '', purchaseDate: new Date().toISOString().split('T')[0], payoutType: 'monthly' });
            fetchCerts();
        } catch (err) { alert('خطأ في الإضافة'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/certificates/${id}`);
            fetchCerts();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-8 fade-in text-right pb-20" dir="rtl">
            <h1 className="text-3xl font-black text-white italic">إدارة الشهادات والودائع</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-fit">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Plus className="text-blue-500" /> إضافة شهادة جديدة
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم البنك" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="المبلغ" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                            <input type="number" step="0.01" placeholder="الفائدة %" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.interestRate} onChange={e => setForm({...form, interestRate: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="المدة (شهور)" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.durationMonths} onChange={e => setForm({...form, durationMonths: e.target.value})} required />
                            <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.payoutType} onChange={e => setForm({...form, payoutType: e.target.value})}>
                                <option value="monthly">عائد شهري</option>
                                <option value="quarterly">عائد ربع سنوي</option>
                                <option value="annual">عائد سنوي</option>
                                <option value="at_maturity">في نهاية المدة</option>
                            </select>
                        </div>
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} />
                        <button type="submit" className="w-full py-4 bg-blue-600 rounded-2xl font-black text-white shadow-lg">حفظ الشهادة</button>
                    </form>
                </div>

                {/* List Section - FIXING ACTIONS FOR MOBILE */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certs.map((cert) => (
                        <div key={cert._id} className="group relative bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all shadow-xl overflow-hidden">
                            {/* Action Buttons: Always visible on Mobile, hover on Desktop */}
                            <div className="absolute top-6 left-6 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                                <button onClick={() => handleDelete(cert._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col h-full space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white">{cert.bankName}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cert.payoutType === 'monthly' ? 'عائد شهري' : 'نظام عائد مختلف'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <p className="text-2xl font-black text-white">{cert.amount.toLocaleString()} <span className="text-xs font-normal opacity-50">ج.م</span></p>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-500">+{cert.interestRate}%</p>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase">الفائدة</p>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-800 flex justify-between items-center">
                                        <div className="text-center">
                                            <p className="text-[8px] text-slate-500 mb-1">الربح الشهري التقريبي</p>
                                            <p className="text-sm font-black text-white">{Math.round((cert.amount * (cert.interestRate/100)) / 12).toLocaleString()} ج.م</p>
                                        </div>
                                        <div className="w-px h-8 bg-slate-700"></div>
                                        <div className="text-center">
                                            <p className="text-[8px] text-slate-500 mb-1">المدة المتبقية</p>
                                            <p className="text-sm font-black text-blue-400">{cert.durationMonths} شهر</p>
                                        </div>
                                    </div>
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
