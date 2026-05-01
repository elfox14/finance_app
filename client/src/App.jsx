import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import Reports from './pages/Reports';
import Cards from './pages/Cards';
import Loans from './pages/Loans';
import Groups from './pages/Groups';
import Certificates from './pages/Certificates';
import Lending from './pages/Lending';
import Borrowed from './pages/Borrowed';
import Notifications from './pages/Notifications';
import ResetPassword from './pages/ResetPassword';
import Budgets from './pages/Budgets';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Ledger from './pages/Ledger';

// مكون لتنظيم الصفحات المحمية داخل الـ Layout
const AppLayout = () => (
    <ProtectedRoute>
        <Layout>
            <Outlet />
        </Layout>
    </ProtectedRoute>
);

function AppRoutes() {
    return (
        <Routes>
            {/* المسارات العامة */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* المسارات المحمية تحت نفس الـ Layout المستقر */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/incomes" element={<Incomes />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/lending" element={<Lending />} />
                <Route path="/borrowed" element={<Borrowed />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router basename="/fin">
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
