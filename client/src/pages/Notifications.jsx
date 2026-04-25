import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const Notifications = () => {
    const [alerts, setAlerts] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // سنجلب القروض والبطاقات لنحسب التنبيهات برمجياً
                const [loansRes, cardsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/loans`, { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL}/cards`, { headers: { Authorization: `Bearer ${user.token}` } })
                ]);

                const newAlerts = [];
                const today = new Date().getDate();

                // تنبيهات القروض
                loansRes.data.forEach(loan => {
                    const daysUntil = loan.dueDay - today;
                    if (daysUntil >= 0 && daysUntil <= 5) {
                        newAlerts.push({
                            id: `loan-${loan._id}`,
                            title: `قسط قادم: ${loan.loanName}`,
                            body: `موعد سداد قسط ${loan.monthlyInstallment} ج.م في يوم ${loan.dueDay} من الشهر.`,
                            type: 'warning',
                            date: new Date()
                        });
                    }
                });

                // تنبيهات البطاقات
                cardsRes.data.forEach(card => {
                    const daysUntil = card.dueDay - today;
                    if (daysUntil >= 0 && daysUntil <= 5) {
                        newAlerts.push({
                            id: `card-${card._id}`,
                            title: `استحقاق بطاقة: ${card.cardName}`,
                            body: `برجاء التأكد من سداد مستحقات البطاقة قبل يوم ${card.dueDay}.`,
                            type: 'info',
                            date: new Date()
                        });
                    }
                });

                setAlerts(newAlerts);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAlerts();
    }, [user.token]);

    return (
        <div className="space-y-8 fade-in" dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Bell className="text-yellow-500" /> مركز التنبيهات
                </h1>
                <span className="bg-slate-800 text-slate-400 px-4 py-1 rounded-full text-sm">
                    {alerts.length} تنبيهات نشطة
                </span>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <div key={alert.id} className={`p-6 rounded-3xl border flex items-start gap-5 transition-all hover:scale-[1.01] ${
                            alert.type === 'warning' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                alert.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                                <AlertCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Calendar size={12} /> {new Date(alert.date).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">{alert.body}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 bg-slate-900/50 rounded-[40px] border border-dashed border-slate-800">
                        <CheckCircle size={64} className="mx-auto mb-6 text-emerald-500/20" />
                        <h3 className="text-xl font-bold text-slate-400">كل شيء تمام!</h3>
                        <p className="text-slate-500 mt-2">لا توجد دفعات مستحقة قريباً. استمتع براحة البال.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
