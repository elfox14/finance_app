import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // بما أن AuthProvider يتعامل مع حالة التحميل العالمية، هنا نتعامل فقط مع التوجيه
    if (loading) return null; // تجنب الرندر المزدوج

    if (!user) {
        // العودة لصفحة الدخول إذا لم يكن المستخدم مسجلاً
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
