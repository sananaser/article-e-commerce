import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute     from './routes/AdminRoute';
import CustomerLayout from './layouts/CustomerLayout';
import ShopPage       from './pages/ShopPage';
import UserDashboard  from './pages/UserDashboard';

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
          element={
            <ProtectedRoute>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ShopPage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="profile" element={<UserDashboard />} />
        </Route>

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
