import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute     from './routes/AdminRoute';

// Admin shell & pages
import AdminLayout    from './admin/AdminLayout';
import DashboardPage  from './admin/pages/DashboardPage';
import CategoriesPage from './admin/pages/CategoriesPage';
import ProductsPage   from './admin/pages/ProductsPage';
import UsersPage      from './admin/pages/UsersPage';
import OrdersPage     from './admin/pages/OrdersPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected customer routes ──────────────────────────── */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>🏠 Home Page — coming soon</h1>
                <p style={{ color: '#6b7280' }}>You are logged in!</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* ── Admin routes (logged in + admin role) ─────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index          element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products"   element={<ProductsPage />} />
          <Route path="users"      element={<UsersPage />} />
          <Route path="orders"     element={<OrdersPage />} />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
