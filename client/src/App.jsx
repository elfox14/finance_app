import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import Cards from './pages/Cards';
import Loans from './pages/Loans';
import Groups from './pages/Groups';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Borrowed from './pages/Borrowed';
import Lending from './pages/Lending';

function App() {
  return (
    <AuthProvider>
      <Router basename="/fin">
        <Routes>
          {/* المسارات العامة (بدون Layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* المسارات المحمية - كلها داخل ProtectedRoute */}
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
          <Route path="/incomes" element={<ProtectedRoute><Layout><Incomes /></Layout></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><Layout><Cards /></Layout></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Layout><Loans /></Layout></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Layout><Groups /></Layout></ProtectedRoute>} />
          <Route path="/borrowed" element={<ProtectedRoute><Layout><Borrowed /></Layout></ProtectedRoute>} />
          <Route path="/lending" element={<ProtectedRoute><Layout><Lending /></Layout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
