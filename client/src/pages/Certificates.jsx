import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Plus, Trash2, Receipt, Calendar, 
    TrendingUp, ShieldCheck, DollarSign, 
    ArrowUpRight, Clock, X, LayoutGrid, Landmark
} from 'lucide-react';

const Certificates = () => {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCertForm, setNewCertForm] = useState({
        certificateName: '', bankName: '', principalAmount: '', 
        interestRate: '', durationMonths: '', startDate: '', payoutFrequency: 'monthly'
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
            setShowAddModal(false);
            setNewCertForm({ certificateName: '', bankName: '', principalAmount: '', interestRate: '', durationMonths: '', startDate: '', payoutFrequency: 'monthly' });
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

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-20" dir="rtl">
            <div className="flex justify-between items-center px-4 md:px-0">
                <h1 className="text-2xl md:text-3xl font-black text-white italic">شهادات الاستثمار</h1>
                <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-900/20">
                    <Plus size={18} /> إضافة شهادة
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-0">
                {(Array.isArray(certs) ? certs : []).map((cert) => {
                    const analytics = cert.analytics || {};
                    return (
                        <div key={cert._id} className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                            <div className="absolute top-6 left-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-20">
                                <button onClick={() => handleDelete(cert._id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            </div>
                            
                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-white">{cert.certificateName}</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{cert.bankName}</p>
                                    </div>
                                    <div className="p-4 bg-emerald-600/10 text-emerald-500 rounded-2xl shadow-inner">
                                        <ShieldCheck size={28} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 bg-slate-800/40 rounded-3xl border border-slate-800">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">المبلغ الأساسي</p>
                                        <p className="text-xl font-black text-white">{cert.principalAmount?.toLocaleString() || 0} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                                    </div>
                                    <div className="p-5 bg-emerald-600/10 rounded-3xl border border-emerald-500/20">
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">العائد الشهري</p>
                                        <p className="text-xl font-black text-emerald-400">{analytics.monthlyYield?.toLocaleString() || 0} <span className="text-[10px] font-normal opacity-50">ج.م</span></p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-500" />
                                        <span className="text-xs text-slate-400 font-bold">تاريخ الاستحقاق: {new Date(analytics.maturityDate).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black rounded-full uppercase">
                                        {cert.interestRate}% سنوي
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                            <Landmark className="text-blue-500" /> تسجيل شهادة استثمار
                        </h2>
                        <form onSubmit={handleCreateCert} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">اسم الشهادة</label>
                                    <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCertForm.certificateName} onChange={e => setNewCertForm({...newCertForm, certificateName: e.target.value})} placeholder="الشهادة البلاتينية" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">البنك</label>
                                    <input required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCertForm.bankName} onChange={e => setNewCertForm({...newCertForm, bankName: e.target.value})} placeholder="البنك الأهلي" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">مبلغ الشهادة (الأصل)</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-lg font-black" value={newCertForm.principalAmount} onChange={e => setNewCertForm({...newCertForm, principalAmount: e.target.value})} placeholder="100,000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">العائد السنوي %</label>
                                    <input type="number" step="0.1" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-lg font-black" value={newCertForm.interestRate} onChange={e => setNewCertForm({...newCertForm, interestRate: e.target.value})} placeholder="23.5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">مدة الشهادة (بالشهور)</label>
                                    <input type="number" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCertForm.durationMonths} onChange={e => setNewCertForm({...newCertForm, durationMonths: e.target.value})} placeholder="12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase px-2">دورية صرف العائد</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCertForm.payoutFrequency} onChange={e => setNewCertForm({...newCertForm, payoutFrequency: e.target.value})}>
                                        <option value="شهري">شهري</option>
                                        <option value="ربع سنوي">ربع سنوي</option>
                                        <option value="سنوي">سنوي</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase px-2">تاريخ الشراء / الإصدار</label>
                                <input type="date" required className="w-full bg-slate-800 border border-slate-700 text-white p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" value={newCertForm.startDate} onChange={e => setNewCertForm({...newCertForm, startDate: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all mt-4">
                                حفظ بيانات الشهادة
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Certificates;
