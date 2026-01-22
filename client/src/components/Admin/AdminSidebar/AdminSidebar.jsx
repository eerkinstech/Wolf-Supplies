import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaClipboardList, FaChartBar, FaSignOutAlt, FaTags, FaComments, FaLayerGroup, FaHeadset } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';

const AdminSidebar = ({ activeTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: FaHome, label: 'Dashboard', id: 'dashboard', path: '/admin/dashboard' },
    { icon: FaBox, label: 'Products', id: 'products', path: '/admin/products' },
    { icon: FaTags, label: 'Categories', id: 'categories', path: '/admin/categories' },
    { icon: FaClipboardList, label: 'Orders', id: 'orders', path: '/admin/orders' },
    { icon: FaComments, label: 'Reviews', id: 'reviews', path: '/admin/reviews' },
    { icon: FaHeadset, label: 'Chat', id: 'chat', path: '/admin/chat' },
    { icon: FaChartBar, label: 'Menu', id: 'menu', path: '/admin/menu' },
    { icon: FaChartBar, label: 'Analytics', id: 'analytics', path: '/admin/analytics' },
    { icon: FaLayerGroup, label: 'Collections', id: 'collections', path: '/admin/collections' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Determine active tab from current route
  const getCurrentActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/categories')) return 'categories';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/reviews')) return 'reviews';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/menu')) return 'menu';
    if (path.includes('/admin/chat')) return 'chat';
    if (path.includes('/admin/collections')) return 'collections';
    if (path.includes('/admin/dashboard') || path === '/admin') return 'dashboard';
    return 'dashboard';
  };

  const currentActiveTab = activeTab || getCurrentActiveTab();

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="text-3xl">⚙️</div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">Management</p>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition duration-300 ${currentActiveTab === item.id
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <item.icon className="text-lg" />
            <span className="font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white bg-red-600 hover:bg-red-700 hover:text-white transition duration-300"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
