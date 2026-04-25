import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, ArrowUpCircle, ArrowDownCircle, 
    CreditCard, Banknote, Users, FileBadge, 
    Handshake, UserMinus, Bell, LogOut, 
    Menu, X, PieChart, Settings, Home
} from 'lucide-react';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={20}/> },
        { path: '/reports', label: 'التقارير المالية', icon: <PieChart size={20}/>, highlight: true },
        { path: '/incomes', label: 'المدخولات', icon: <ArrowUpCircle size={20}/> },
        { path: '/expenses', label: 'المصروفات', icon: <ArrowDownCircle size={20}/> },
        { path: '/cards', label: 'البطاقات', icon: <CreditCard size={20}/> },
        { path: '/loans', label: 'القروض', icon: <Banknote size={20}/> },
        { path: '/groups', label: 'الجمعيات', icon: <Users size={20}/> },
        { path: '/certificates', label: 'الشهادات', icon: <FileBadge size={20}/> },
        { path: '/lending', label: 'لي طرف الآخرين', icon: <Handshake size={20}/> },
        { path: '/borrowed', label: 'عليّ للآخرين', icon: <UserMinus size={20}/> },
        { path: '/notifications', label: 'التنبيهات', icon: <Bell size={20}/> },
    ];

    const bottomNavItems = [
        { path: '/', label: 'الرئيسية', icon: <Home size={22}/> },
        { path: '/expenses', label: 'المصروفات', icon: <ArrowDownCircle size={22}/> },
        { path: '/incomes', label: 'المدخولات', icon: <ArrowUpCircle size={22}/> },
        { path: '/reports', label: 'التقارير', icon: <PieChart size={22}/> },
        { path: '/notifications', label: 'التنبيهات', icon: <Bell size={22}/> },
    ];

    const NavLink = ({ item }) => (
        <Link 
            to={item.path} 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : item.highlight ? 'text-blue-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            {item.icon}
            <span>{item.label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans" dir="rtl">
            {/* 📱 Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 border-b border-slate-800 sticky top-0 z-[60] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs italic">ج</div>
                    <span className="font-black text-lg tracking-tighter italic">جيبي</span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/notifications')}
                        className="p-2 text-slate-400 relative"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-slate-800 rounded-xl text-blue-500"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* 🖥️ Sidebar (Desktop & Mobile Overlay) */}
            <aside className={`
                fixed md:sticky top-0 right-0 h-full md:h-screen w-72 bg-slate-900 border-l border-slate-800 
                z-[100] transition-transform duration-300 ease-in-out flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8">
                    <div className="hidden md:block mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/40 italic">ج</div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter italic">جيبي</h1>
                                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Geybi Pro</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
                        {menuItems.map((item) => (
                            <NavLink key={item.path} item={item} />
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-800 bg-slate-900/50">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                    >
                        <LogOut size={20}/>
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* 📱 Bottom Navigation (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 backdrop-blur-xl z-[60] px-4 py-2 flex justify-between items-center pb-safe">
                {bottomNavItems.map((item) => (
                    <Link 
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center gap-1 p-2 transition-all ${
                            location.pathname === item.path ? 'text-blue-500' : 'text-slate-500'
                        }`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${location.pathname === item.path ? 'bg-blue-600/10' : ''}`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* 🌑 Mobile Overlay Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* 🚀 Main Content */}
            <main className="flex-1 p-4 md:p-10 relative mb-16 md:mb-0">
                {children}
            </main>
        </div>
    );
};

export default Layout;
