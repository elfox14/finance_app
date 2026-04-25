import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, CreditCard, Banknote, Group, Bell, Settings, LogOut } from 'lucide-react';

const Layout = ({ children }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'الرئيسية', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'المصروفات', icon: <ArrowDownCircle size={20} />, path: '/expenses' },
        { name: 'المدخولات', icon: <ArrowUpCircle size={20} />, path: '/incomes' },
        { name: 'البطاقات', icon: <CreditCard size={20} />, path: '/cards' },
        { name: 'القروض', icon: <Landmark size={20} />, path: '/loans' },
        { name: 'الجمعيات', icon: <Users size={20} />, path: '/groups' },
        { name: 'السلف (عليّ)', icon: <ArrowDownCircle size={20} />, path: '/borrowed' },
        { name: 'التسليف (لي)', icon: <ArrowUpCircle size={20} />, path: '/lending' },
        { name: 'التنبيهات', icon: <Bell size={20} />, path: '/notifications' },
        { name: 'الإعدادات', icon: <Settings size={20} />, path: '/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200" dir="rtl">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col fixed h-full z-20">
                <div className="p-6 text-2xl font-black text-blue-500 border-b border-slate-800">محفظتي Pro</div>
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                location.pathname === item.path 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 mr-64 p-8">
                <header className="flex justify-between items-center mb-10 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl sticky top-0 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-white">أهلاً بك، {user?.name}</h1>
                        <p className="text-slate-400 text-sm">إليك ملخص لحالتك المالية اليوم</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default Layout;
