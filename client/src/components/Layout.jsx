import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Wallet, ArrowUpRight, 
    ArrowDownLeft, CreditCard, Landmark, 
    Users, Bell, LogOut, Menu, X, PieChart, 
    Receipt, ShieldCheck, Target, Handshake,
    Coins, Banknote, History
} from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const userName = user?.name || 'مستخدم جيبي';

    // هيكلة القائمة بناءً على المحاور الستة للتصور الجديد
    const navigationGroups = [
        {
            title: "التدفقات النقدية",
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
            title: "الموازنات",
            items: [
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
            ]
        }
    ];

    const bottomNavItems = [
        { path: '/', icon: LayoutDashboard, label: 'الرئيسية' },
        { path: '/expenses', icon: ArrowUpRight, label: 'المصاريف' },
        { path: '/budgets', icon: Target, label: 'موازنات' },
        { path: '/reports', icon: PieChart, label: 'تقارير' },
        { path: '/notifications', icon: Bell, label: 'تنبيهات' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-500/30" dir="rtl">
            {/* Desktop Sidebar - المستشار المالي */}
            <aside className="fixed right-0 top-0 h-screen w-80 bg-slate-950 border-l border-slate-900 hidden lg:flex flex-col z-50 overflow-hidden">
                <div className="p-8 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter italic">جيبي <span className="text-blue-500">v2.5</span></h1>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                    {/* Dashboard Link */}
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${
                            isActive('/') ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'hover:bg-slate-900'
                        }`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-black text-sm">لوحة القيادة المركزية</span>
                    </Link>

                    {/* Navigation Groups */}
                    {navigationGroups.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">{group.title}</h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                            isActive(item.path) 
                                            ? 'bg-slate-800 text-white border-r-4 border-blue-500' 
                                            : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
                                        }`}
                                    >
                                        <item.icon size={18} className={isActive(item.path) ? 'text-blue-500' : 'text-slate-700 group-hover:text-blue-400'} />
                                        <span className="font-bold text-xs">{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-900 bg-slate-950/50">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black text-xs"
                    >
                        <LogOut size={18} /> خروج من النظام
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 right-0 left-0 h-16 bg-black/90 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-6 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Wallet className="text-white" size={18} />
                    </div>
                    <span className="font-black text-white text-lg italic">جيبي</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white">
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/95 z-[100] lg:hidden animate-in fade-in duration-300">
                    <div className="h-full w-full flex flex-col p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-10 border-b border-slate-900 pb-6">
                            <h2 className="font-black text-white text-2xl italic">القائمة الشاملة</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-3 bg-slate-900 rounded-2xl text-slate-500">
                                <X size={28} />
                            </button>
                        </div>
                        <nav className="space-y-10">
                            {navigationGroups.map((group, idx) => (
                                <div key={idx} className="space-y-4">
                                    <h3 className="text-blue-500 font-black text-sm uppercase tracking-widest">{group.title}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {group.items.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className={`flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border ${
                                                    isActive(item.path) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                                                }`}
                                            >
                                                <item.icon size={24} />
                                                <span className="font-bold text-xs">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <button onClick={logout} className="mt-12 w-full py-5 bg-red-500/10 text-red-500 rounded-3xl font-black text-lg">خروج</button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="lg:pr-80 pt-20 lg:pt-0 p-4 md:p-12 min-h-screen">
                <div className="max-w-7xl mx-auto pb-32 lg:pb-0">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-900 flex items-center justify-around px-4 z-[70] pb-safe">
                {bottomNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                            isActive(item.path) ? 'text-blue-500 scale-110' : 'text-slate-600'
                        }`}
                    >
                        <item.icon size={22} />
                        <span className="text-[10px] font-black">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
