import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Budgets from './pages/Budgets'; // استيراد صفحة الموازنات الجديدة
import Accounts from './pages/Accounts'; // صفحة الحسابات
import Settings from './pages/Settings'; // صفحة الإعدادات
import Transactions from './pages/Transactions'; // صفحة العمليات الموحدة

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/expenses" element={
                <ProtectedRoute>
                    <Layout><Expenses /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/transactions" element={
                <ProtectedRoute>
                    <Layout><Transactions /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/incomes" element={
                <ProtectedRoute>
                    <Layout><Incomes /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reports" element={
                <ProtectedRoute>
                    <Layout><Reports /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/cards" element={
                <ProtectedRoute>
                    <Layout><Cards /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/loans" element={
                <ProtectedRoute>
                    <Layout><Loans /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/groups" element={
                <ProtectedRoute>
                    <Layout><Groups /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/certificates" element={
                <ProtectedRoute>
                    <Layout><Certificates /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/lending" element={
                <ProtectedRoute>
                    <Layout><Lending /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/borrowed" element={
                <ProtectedRoute>
                    <Layout><Borrowed /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/budgets" element={
                <ProtectedRoute>
                    <Layout><Budgets /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/notifications" element={
                <ProtectedRoute>
                    <Layout><Notifications /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/accounts" element={
                <ProtectedRoute>
                    <Layout><Accounts /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/settings" element={
                <ProtectedRoute>
                    <Layout><Settings /></Layout>
                </ProtectedRoute>
            } />

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
