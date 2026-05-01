import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Wallet, ArrowUpRight, 
    ArrowDownLeft, CreditCard, Landmark, 
    Users, Bell, LogOut, Menu, X, PieChart, 
    Receipt, Target, Handshake,
    Banknote, Settings, ListChecks,
    ChevronLeft
} from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const location = useLocation();

    const navigationGroups = [
        {
            title: "العمليات النقدية",
            items: [
                { path: '/expenses', icon: ArrowUpRight, label: 'المصروفات' },
                { path: '/incomes', icon: ArrowDownLeft, label: 'المدخولات' },
            ]
        },
        {
            title: "الالتزامات",
            items: [
                { path: '/loans', icon: Landmark, label: 'القروض' },
                { path: '/cards', icon: CreditCard, label: 'البطاقات' },
                { path: '/borrowed', icon: Handshake, label: 'سلف عليك' },
                { path: '/groups', icon: Users, label: 'الجمعيات' },
            ]
        },
        {
            title: "الأصول والحقوق",
            items: [
                { path: '/lending', icon: Handshake, label: 'سلف لك' },
                { path: '/certificates', icon: Receipt, label: 'الشهادات' },
                { path: '/accounts', icon: Banknote, label: 'الرصيد والبنك' },
            ]
        },
        {
            title: "الموازنات والتدقيق",
            items: [
                { path: '/ledger', icon: ListChecks, label: 'السجل الموحد' },
                { path: '/budgets', icon: Target, label: 'إدارة الموازنات' },
            ]
        },
        {
            title: "التحليل المالي",
            items: [
                { path: '/reports', icon: PieChart, label: 'التحليلات والتقارير' },
            ]
        },
        {
            title: "مركز القرار",
            items: [
                { path: '/notifications', icon: Bell, label: 'التنبيهات والفرص' },
                { path: '/settings', icon: Settings, label: 'الإعدادات' },
            ]
        }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans" dir="rtl">
            {/* Desktop Sidebar */}
            <aside className="fixed right-0 top-0 h-screen w-80 bg-slate-900 border-l border-slate-800 hidden lg:flex flex-col z-50">
                <div className="p-8 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-black text-white italic">جيبي <span className="text-blue-500">v4.0</span></h1>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                    <Link
                        to="/"
                        className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all ${
                            isActive('/') ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <LayoutDashboard size={20} />
                            <span className="font-bold text-sm">لوحة القيادة</span>
                        </div>
                        {isActive('/') && <ChevronLeft size={16} />}
                    </Link>

                    {navigationGroups.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.title}</h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                                            isActive(item.path) ? 'bg-slate-800 text-white border-r-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={isActive(item.path) ? 'text-blue-500' : 'text-slate-600 group-hover:text-blue-400'} />
                                            <span className="text-xs font-bold">{item.label}</span>
                                        </div>
                                        {isActive(item.path) && <ChevronLeft size={14} />}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-xs">
                        <LogOut size={18} /> خروج
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 right-0 left-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-[60]">
                <div className="flex items-center gap-2">
                    <Wallet className="text-blue-500" size={24} />
                    <span className="font-black text-white text-lg">جيبي</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/90 z-[100] lg:hidden flex justify-end">
                    <div className="w-80 h-full bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="p-6 flex justify-between items-center border-b border-slate-800">
                            <span className="font-black text-white">القائمة</span>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
                        </div>
                        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-80px)] no-scrollbar">
                            {navigationGroups.map((group, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase">{group.title}</h3>
                                    <div className="space-y-1">
                                        {group.items.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                                            >
                                                <item.icon size={18} />
                                                <span className="text-sm font-bold">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="lg:pr-80 pt-20 lg:pt-0 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto p-4 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
