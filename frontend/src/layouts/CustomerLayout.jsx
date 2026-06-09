import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartSidebar from '../components/cart/CartSidebar';

export default function CustomerLayout() {
  return (
    <div className="customer-shell">
      <Navbar />
      <CartSidebar />
      <Outlet />
    </div>
  );
}
