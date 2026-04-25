import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Trash2, Calendar, UserCheck } from 'lucide-react';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [form, setForm] = useState({
        groupName: '',
        totalAmount: '',
        monthlyShare: '',
        membersCount: '',
        myTurn: 1,
        startDate: '',
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setGroups(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/groups`, 
                form,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setForm({ groupName: '', totalAmount: '', monthlyShare: '', membersCount: '', myTurn: 1, startDate: '' });
            fetchGroups();
        } catch (err) {
            alert('حدث خطأ أثناء إضافة الجمعية');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذه الجمعية؟')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/groups/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchGroups();
        } catch (err) {
            alert('خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white">إدارة الجمعيات</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Plus className="text-indigo-500" /> إضافة جمعية جديدة
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            placeholder="اسم الجمعية (مثلاً: جمعية الشغل)"
                            className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            value={form.groupName}
                            onChange={(e) => setForm({...form, groupName: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="number" placeholder="مبلغ القبض"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={form.totalAmount}
                                onChange={(e) => setForm({...form, totalAmount: e.target.value})}
                                required
                            />
                            <input 
                                type="number" placeholder="القسط الشهري"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={form.monthlyShare}
                                onChange={(e) => setForm({...form, monthlyShare: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="number" placeholder="عدد الأفراد"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={form.membersCount}
                                onChange={(e) => setForm({...form, membersCount: e.target.value})}
                                required
                            />
                            <input 
                                type="number" placeholder="دوري (ترتيبي)"
                                className="bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={form.myTurn}
                                onChange={(e) => setForm({...form, myTurn: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">تاريخ البداية</label>
                            <input 
                                type="date"
                                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl outline-none text-sm"
                                value={form.startDate}
                                onChange={(e) => setForm({...form, startDate: e.target.value})}
                                required
                            />
                        </div>
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ الجمعية'}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <div key={group._id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 bg-indigo-600 h-full"></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-1">{group.groupName}</h4>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Calendar size={14} /> {new Date(group.startDate).toLocaleDateString('ar-EG')}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                                        <Users size={20} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-800/50 p-3 rounded-2xl">
                                        <p className="text-xs text-slate-500 mb-1">مبلغ القبض</p>
                                        <p className="text-lg font-bold text-white">{group.totalAmount.toLocaleString()} <span className="text-xs font-normal text-slate-400">ج.م</span></p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-2xl">
                                        <p className="text-xs text-slate-500 mb-1">دوري في القبض</p>
                                        <p className="text-lg font-bold text-indigo-400 flex items-center gap-2"><UserCheck size={18} /> {group.myTurn}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                                    <div className="text-sm text-slate-400">
                                        القسط: <span className="text-white font-bold">{group.monthlyShare} ج.م</span>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(group._id)}
                                        className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p>لا توجد جمعيات مسجلة حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Groups;
