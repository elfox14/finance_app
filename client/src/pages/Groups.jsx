import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Plus, Trash2, Calendar, UserPlus, Edit2, X } from 'lucide-react';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [form, setForm] = useState({
        groupName: '', totalAmount: '', membersCount: '', monthlyInstallment: '', startDate: '', payoutOrder: 1
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchGroups = async () => {
        try {
            const res = await api.get('/groups');
            setGroups(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchGroups(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/groups/${editingId}`, form);
                setEditingId(null);
            } else {
                await api.post('/groups', form);
            }
            setForm({ groupName: '', totalAmount: '', membersCount: '', monthlyInstallment: '', startDate: '', payoutOrder: 1 });
            fetchGroups();
        } catch (err) { alert('حدث خطأ أثناء الحفظ'); }
        finally { setLoading(false); }
    };

    const handleEdit = (group) => {
        setEditingId(group._id);
        setForm({
            groupName: group.groupName,
            totalAmount: group.totalAmount,
            membersCount: group.membersCount,
            monthlyInstallment: group.monthlyInstallment,
            startDate: group.startDate?.split('T')[0] || '',
            payoutOrder: group.payoutOrder
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد؟')) return;
        try {
            await api.delete(`/groups/${id}`);
            fetchGroups();
        } catch (err) { alert('خطأ في الحذف'); }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة الجمعيات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-8 rounded-3xl border shadow-xl h-fit transition-all ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            {editingId ? <Edit2 className="text-indigo-400" /> : <Plus className="text-blue-500" />}
                            {editingId ? 'تعديل الجمعية' : 'إضافة جمعية'}
                        </h3>
                        {editingId && (
                            <button onClick={() => {setEditingId(null); setForm({groupName:'', totalAmount:'', membersCount:'', monthlyInstallment:'', startDate:'', payoutOrder:1});}} className="text-slate-500 hover:text-white"><X size={20}/></button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input placeholder="اسم الجمعية" className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.groupName} onChange={e => setForm({...form, groupName: e.target.value})} required />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="مبلغ القبض" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} required />
                            <input type="number" placeholder="القسط الشهري" className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none" value={form.monthlyInstallment} onChange={e => setForm({...form, monthlyInstallment: e.target.value})} required />
                        </div>
                        <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-xl shadow-lg ${editingId ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                            {loading ? 'جاري الحفظ...' : (editingId ? 'تحديث البيانات' : 'حفظ الجمعية')}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"><Users size={24} /></div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{group.groupName}</h4>
                                        <p className="text-slate-500 text-sm">مبلغ القبض: {group.totalAmount?.toLocaleString()} ج.م</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(group)} className="text-slate-500 hover:text-blue-400"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDelete(group._id)} className="text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Groups;
