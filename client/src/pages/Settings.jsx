import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, Settings as SettingsIcon, Palette } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useAuth();

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <SettingsIcon className="text-slate-400" /> إعدادات الحساب
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <User className="text-blue-500" /> المعلومات الشخصية
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">اسم المستخدم</p>
                                        <p className="text-white font-bold">{user?.name || 'مستخدم'}</p>
                                    </div>
                                </div>
                                <button className="text-blue-500 text-sm hover:underline">تعديل</button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                                        <p className="text-white font-bold">{user?.email}</p>
                                    </div>
                                </div>
                                <Shield className="text-slate-700" size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <Palette className="text-emerald-500" /> التفضيلات والمظهر
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-bold">الوضع الداكن (Dark Mode)</p>
                                <p className="text-slate-500 text-sm">التطبيق يعمل حالياً بالوضع الداكن حصرياً لتوفير الطاقة وحماية العين.</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-6">
                    <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl shadow-xl">
                        <h3 className="text-xl font-bold mb-4 text-red-500 flex items-center gap-2">
                            <LogOut /> تسجيل الخروج
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            هل تريد الخروج من الجلسة الحالية؟ ستحتاج لإدخال بياناتك مرة أخرى عند العودة.
                        </p>
                        <button 
                            onClick={logout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-900/20"
                        >
                            تسجيل الخروج الآن
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
