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
          
          {/* الصفحة الرئيسية أصبحت متاحة للجميع بدون ProtectedRoute */}
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />

          {/* الصفحات التي تتطلب بيانات خاصة تظل محمية */}
          <Route path="/expenses" element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
          <Route path="/incomes" element={<ProtectedRoute><Layout><div className="text-white p-20">قريباً: صفحة المدخولات</div></Layout></ProtectedRoute>} />
          <Route path="/cards" element={<ProtectedRoute><Layout><div className="text-white p-20">مركز البطاقات</div></Layout></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Layout><div className="text-white p-20">مركز القروض</div></Layout></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Layout><div className="text-white p-20">الجمعيات</div></Layout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Layout><div className="text-white p-20">التنبيهات</div></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><div className="text-white p-20">الإعدادات</div></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
