import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    Search, Filter, ArrowUpRight, ArrowDownLeft, 
    ArrowLeftRight, Calendar, Tag, CreditCard, 
    CheckCircle2, Clock, Trash2, ChevronDown, Landmark, Wallet
} from 'lucide-react';

const Ledger = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredTxs = transactions.filter(tx => {
        const matchesSearch = (tx.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                             (tx.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || 
                           (filterType === 'in' && tx.type === 'دخل') ||
                           (filterType === 'out' && (tx.type === 'مصروف' || tx.type === 'سداد')) ||
                           (filterType === 'transfer' && tx.type === 'تحويل');
        return matchesSearch && matchesType;
    });

    const getIcon = (type) => {
        if (type === 'دخل') return <ArrowUpRight className="text-emerald-500" />;
        if (type === 'مصروف' || type === 'سداد') return <ArrowDownLeft className="text-red-500" />;
        if (type === 'تحويل') return <ArrowLeftRight className="text-blue-500" />;
        return <Clock className="text-slate-500" />;
    };

    if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="space-y-10 fade-in text-right pb-24 md:pb-10" dir="rtl">
            {/* Header */}
            <header className="px-4 md:px-0">
                <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">السجل الموحد (Ledger)</h1>
                <p className="text-slate-500 text-xs md:text-sm mt-2">عرض تاريخي شامل لكافة الحركات المالية والقيود المحاسبية للنظام</p>
            </header>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 px-4 md:px-0">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="بحث في الوصف أو الفئة..." 
                        className="w-full bg-slate-900 border border-slate-800 text-white pr-12 pl-4 py-4 rounded-2xl outline-none focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <FilterButton active={filterType === 'all'} onClick={() => setFilterType('all')} label="الكل" />
                    <FilterButton active={filterType === 'in'} onClick={() => setFilterType('in')} label="وارد" />
                    <FilterButton active={filterType === 'out'} onClick={() => setFilterType('out')} label="صادر" />
                    <FilterButton active={filterType === 'transfer'} onClick={() => setFilterType('transfer')} label="تحويل" />
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden mx-4 md:mx-0">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right">
                        <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                            <tr>
                                <th className="p-6">التاريخ</th>
                                <th className="p-6">العملية / الفئة</th>
                                <th className="p-6">الحساب</th>
                                <th className="p-6">التصنيف المحاسبي</th>
                                <th className="p-6">المبلغ</th>
                                <th className="p-6">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredTxs.map((tx) => (
                                <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-800 p-2 rounded-lg text-slate-400"><Calendar size={16} /></div>
                                            <span className="text-xs font-bold text-slate-300">{new Date(tx.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-inner">
                                                {getIcon(tx.type)}
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm">{tx.category || 'بدون فئة'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{tx.notes || 'لا يوجد ملاحظات'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Landmark size={14} />
                                            <span className="text-xs font-bold">{tx.accountId?.name || 'حساب مجهول'}</span>
                                            {tx.destinationAccountId && (
                                                <>
                                                    <ChevronDown size={12} className="-rotate-90" />
                                                    <span className="text-xs font-bold text-blue-400">{tx.destinationAccountId?.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-slate-800 text-[10px] font-black text-slate-400 rounded-lg border border-slate-700 uppercase tracking-tighter">
                                            {tx.classification?.replace('_', ' ') || 'unclassified'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <p className={`text-lg font-black ${tx.type === 'دخل' ? 'text-emerald-400' : tx.type === 'تحويل' ? 'text-blue-400' : 'text-white'}`}>
                                            {tx.type === 'دخل' ? '+' : '-'}{tx.amount?.toLocaleString()} 
                                            <span className="text-[10px] opacity-40 mr-1">ج.م</span>
                                        </p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            {tx.status === 'مُسوّى' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-orange-500" />}
                                            <span className={`text-[10px] font-black ${tx.status === 'مُسوّى' ? 'text-emerald-500' : 'text-orange-500'}`}>{tx.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const FilterButton = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`px-6 py-4 rounded-2xl text-xs font-black transition-all border ${active ? 'bg-blue-600 border-transparent text-white shadow-xl shadow-blue-900/30' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
    >
        {label}
    </button>
);

export default Ledger;
