import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';

function App() {
  return (
    <AuthProvider>
      <Router basename="/fin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
          <Route path="/incomes" element={<ProtectedRoute><Layout><div className="text-white">قريباً: صفحة المدخولات</div></Layout></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><Layout><div className="text-white">قريباً: مركز البطاقات</div></Layout></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Layout><div className="text-white">قريباً: مركز القروض</div></Layout></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Layout><div className="text-white">قريباً: الجمعيات</div></Layout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Layout><div className="text-white">قريباً: التنبيهات</div></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><div className="text-white">قريباً: الإعدادات</div></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
