import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function CustomerLayout() {
  return (
    <div className="customer-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}
