import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Wallet, ArrowUpRight, 
    ArrowDownLeft, CreditCard, Landmark, 
    Users, Bell, LogOut, Menu, X, PieChart, Receipt
} from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const userName = user?.name || 'مستخدم جيبي';

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'الرئيسية' },
        { path: '/reports', icon: PieChart, label: 'التحليلات' },
        { path: '/expenses', icon: ArrowUpRight, label: 'المصروفات' },
        { path: '/incomes', icon: ArrowDownLeft, label: 'المدخولات' },
        { path: '/cards', icon: CreditCard, label: 'البطاقات' },
        { path: '/loans', icon: Landmark, label: 'القروض' },
        { path: '/groups', icon: Users, label: 'الجمعيات' },
        { path: '/certificates', icon: Receipt, label: 'الشهادات' },
        { path: '/lending', icon: Wallet, label: 'لي طرف الآخرين' },
        { path: '/borrowed', icon: Wallet, label: 'عليّ للآخرين' },
    ];

    const bottomNavItems = [
        { path: '/', icon: LayoutDashboard, label: 'الرئيسية' },
        { path: '/expenses', icon: ArrowUpRight, label: 'المصاريف' },
        { path: '/incomes', icon: ArrowDownLeft, label: 'المدخولات' },
        { path: '/reports', icon: PieChart, label: 'التقارير' },
        { path: '/notifications', icon: Bell, label: 'تنبيهات' },
    ];

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-blue-500/30" dir="rtl">
            {/* Desktop Sidebar */}
            <aside className="fixed right-0 top-0 h-screen w-72 bg-slate-950 border-l border-slate-900 hidden lg:flex flex-col z-50">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">جيبي <span className="text-blue-500">Geybi</span></h1>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                    location.pathname === item.path 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                    : 'hover:bg-slate-900 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                                <span className="font-bold text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-900 bg-slate-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-inner">
                            {userName.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{userName}</p>
                            <p className="text-[10px] text-slate-500 font-medium">الخطة الاحترافية</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all duration-300 font-bold text-sm"
                    >
                        <LogOut size={20} /> تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 right-0 left-0 h-16 bg-black border-b border-slate-900 flex items-center justify-between px-6 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Wallet className="text-white" size={18} />
                    </div>
                    <span className="font-black text-white text-lg">جيبي</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300">
                    <div className="h-full w-80 bg-slate-950 border-l border-slate-900 float-right flex flex-col p-8 slide-in-right">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="font-black text-white text-xl">القائمة</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                                        location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400'
                                    }`}
                                >
                                    <item.icon size={22} />
                                    <span className="font-bold">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <button 
                            onClick={logout}
                            className="mt-6 flex items-center gap-4 px-5 py-4 text-red-400 font-bold rounded-2xl bg-red-500/5"
                        >
                            <LogOut size={22} /> تسجيل الخروج
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="lg:pr-72 pt-20 lg:pt-8 p-4 md:p-8 min-h-screen pb-32 lg:pb-8">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation for Mobile - FIXED VISIBILITY */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-safe h-20">
                {bottomNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center gap-1.5 py-2 px-3 transition-all duration-300 rounded-xl ${
                            location.pathname === item.path ? 'text-blue-500 bg-blue-500/5' : 'text-slate-500'
                        }`}
                    >
                        <item.icon size={22} className={location.pathname === item.path ? 'scale-110' : 'opacity-70'} />
                        <span className="text-[10px] font-black">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
