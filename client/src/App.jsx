import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import Expenses from './pages/Expenses';
import Cards from './pages/Cards';
import Loans from './pages/Loans';
import Groups from './pages/Groups';
import Certificates from './pages/Certificates';
import Lending from './pages/Lending';
import Borrowed from './pages/Borrowed';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

const AppRoutes = () => {
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
            <Route path="/reports" element={
                <ProtectedRoute>
                    <Layout><Reports /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/incomes" element={
                <ProtectedRoute>
                    <Layout><Incomes /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/expenses" element={
                <ProtectedRoute>
                    <Layout><Expenses /></Layout>
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
            <Route path="/notifications" element={
                <ProtectedRoute>
                    <Layout><Notifications /></Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

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
