import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    ArrowDownCircle, 
    ArrowUpCircle, 
    CreditCard, 
    Landmark, 
    Users, 
    Bell, 
    Settings, 
    LogOut, 
    Menu, 
    X,
    Wallet,
    Handshake,
    CircleDollarSign
} from 'lucide-react';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'الرئيسية', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'المصروفات', icon: <ArrowDownCircle size={20} />, path: '/expenses' },
        { name: 'المدخولات', icon: <ArrowUpCircle size={20} />, path: '/incomes' },
        { name: 'البطاقات', icon: <CreditCard size={20} />, path: '/cards' },
        { name: 'القروض', icon: <Landmark size={20} />, path: '/loans' },
        { name: 'الجمعيات', icon: <Users size={20} />, path: '/groups' },
        { name: 'السلف (عليّ)', icon: <Handshake size={20} />, path: '/borrowed' },
        { name: 'التسليف (لي)', icon: <CircleDollarSign size={20} />, path: '/lending' },
        { name: 'التنبيهات', icon: <Bell size={20} />, path: '/notifications' },
        { name: 'الإعدادات', icon: <Settings size={20} />, path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-['Cairo']" dir="rtl">
            {/* Mobile Header */}
            <header className="lg:hidden bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ج</div>
                    <span className="font-bold text-white tracking-tight">جيبي</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-lg text-white">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 right-0 z-40 w-72 bg-slate-900 border-l border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="h-full flex flex-col p-6">
                        <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">ج</div>
                            <span className="font-black text-xl text-white tracking-tighter">جيبي</span>
                        </div>

                        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                        ${location.pathname === item.path 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                                    `}
                                >
                                    <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-bold text-sm">{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            {user ? (
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm"
                                >
                                    <LogOut size={20} />
                                    <span>تسجيل الخروج</span>
                                </button>
                            ) : (
                                <Link 
                                    to="/login"
                                    className="flex items-center gap-3 w-full px-4 py-3.5 text-blue-400 hover:bg-blue-500/10 rounded-2xl transition-all font-bold text-sm"
                                >
                                    <LogOut size={20} className="rotate-180" />
                                    <span>تسجيل الدخول</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-10 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
